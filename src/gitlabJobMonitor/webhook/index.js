const events = require("events");
const process = require("process")

const initWebhooks = require("./init")
const setupExpress = require("./server")

module.exports = async function createWebhookMonitor(api, config) {
    config = config.webhook;
    if (!config) {
        console.error("Configuration gitlab.webhook missing")
        process.exit(1)
    }

    await initWebhooks(api, config);

    const server = setupExpress();

    const eventEmitter = new events.EventEmitter();

    server.use((req, res) => {
        if (req.path !== "/" || req.method !== "POST") {
            res.end();
            return;
        }

        if (config.token && req.headers['X-Gitlab-Token'] !== config.token) {
            res.end();
            return;
        }

        eventEmitter.emit("update", req.body.jobId)

        res.send({})
    })

    server.listen(config?.port || 8000)


    return eventEmitter;
}