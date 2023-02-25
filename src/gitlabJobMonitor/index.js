const events = require("events")
const GitlabApi = require("./api");
const createWebhookMonitor = require("./webhook")

const statusMap = {
    "pending": ['created', 'pending', 'waiting_for_resource'],
    "running": ["running"],
    "closed": ["skipped", "success", "failed", "cancelled"]
}

function normalizeJobStatus(job) {
    if (!job)
        return null;

    for (const statusName in statusMap)
        if (statusMap[statusName].includes(job.status))
            return statusName

    return "unknown";
}

class GitlabJobMonitor extends events.EventEmitter {
    constructor(config) {
        super()
        this.api = new GitlabApi(config)
        this.jobs = new Map();
        this.config = config

        this.init()
    }

    __updateJob(job) {
        const existingStatus = normalizeJobStatus(this.jobs.get(job.id))
        const newStatus = normalizeJobStatus(job)
        if (existingStatus === newStatus) {
            this.jobs.set(job.id, job)
        }
        else if (newStatus === "pending") {
            console.log(`[INFO] Job '${job.id}' is pending`)
            this.jobs.set(job.id, job)
            this.emit("pending", job)
        }
        else if (newStatus === "running") {
            console.log(`[INFO] Job '${job.id}' is running`)
            this.jobs.set(job.id, job)
            this.emit("running", job)
        }
        else if (newStatus === "closed") {
            this.__closeJob(job)
        }
        else {
            console.warn(`[WARNING] Status unknown for job '${job.id}'`)
            console.warn(job);
        }
    }

    __closeJob(job) {
        console.log(`[INFO] Job '${job.id}' is closed`)
        this.jobs.delete(job.id)
        this.emit("closed", job)
    }

    async init() {
        this.webhookMonitor = await createWebhookMonitor(this.api, this.config);

        this.webhookMonitor.on("update", (job) => {
            this.__updateJob(job)
        })

        const pollIntervalSeconds = this.config.pollIntervalSeconds || 15 * 60 * 1000

        await this.synchronize(true);
        setInterval(() => this.synchronize(), pollIntervalSeconds)
    }

    async synchronize(initial = false) {
        const jobs = await this.api.getAllJobs([...statusMap.pending, ...statusMap.running])

        for (const job of jobs) {
            const existingJob = this.jobs.get(job.id);
            // Jobs we keep track of but we have wrong status
            if (existingJob) {
                if (existingJob.status === job.status)
                    continue

                console.warn(`[WARNING] Job '${job.id}' of project ${job.project.name} updated by polling`)

                this.__updateJob(job)
            }
            // Jobs we don't keep track of but we should
            else {
                if (!initial)
                    console.warn(`[WARNING] Job '${job.id}' of project ${job.project.name} picked up by polling`)

                this.__updateJob(job);
            }
        }

        // Jobs we keep track of but we shouldn't
        for (const jobId of this.jobs.keys()) {
            if (jobs.some(x => x.id == jobId))
                continue

            console.warn(`[WARNING] Job '${jobId}' removed by polling`)
        }
    }

    getJobs() {
        return this.jobs.values()
    }
}

module.exports = GitlabJobMonitor