const { default: axios } = require("axios")

class GitlabApi {
    constructor(config) {
        if (!config.url) {
            console.error("Configuration gitlab.url missing")
            process.exit(1)
        }

        if (!config.accessToken) {
            console.error("Configuration gitlab.accessToken missing")
            process.exit(1)
        }

        this.url = config.url
        this.accessToken = config.accessToken;
    }

    async getProjects() {
        const projectsResponse = await axios.get(`${this.url}/api/v4/projects?simple=true`, {
            headers: {
                Authorization: `Bearer ${this.accessToken}`
            }
        })

        return projectsResponse.data;
    }

    async getAllJobs(scope) {
        return [];

        const projects = this.getProjects()

        const jobs = []
        for (const project of projects) {
            const jobsResponse = await axios.get(`${this.url}/api/v4/projects/${project.id}/jobs`, {
                params: {
                    scope
                },
                headers: {
                    Authorization: `Bearer ${this.accessToken}`
                }
            })

            jobs.push(...jobsResponse.data.map(x => ({ project, ...x })))
        }

        return jobs
    }
}

module.exports = GitlabApi