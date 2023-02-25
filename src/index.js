const GitlabJobMonitor = require("./gitlabJobMonitor");
const RunnerManager = require("./runnerManager");
const drivers = require("./runnerDrivers");

(async function () {
    const app = require("./app")
    if (!app.config.gitlab) {
        console.error("Configuration gitlab missing")
        process.exit(1)
    }

    const gitlab = new GitlabJobMonitor(app.config.gitlab)

    const types = new Map()
    for (const [name, config] of Object.entries(app.config.runnerTypes || {})) {
        const driver = drivers[config.driver];

        types.set(name, new driver(config));
    }

    const runnerManager = new RunnerManager({ types })
    for (const [name, config] of Object.entries(app.config.runners || {}))
        runnerManager.registerRunner(name, config)


})().catch(console.error)
