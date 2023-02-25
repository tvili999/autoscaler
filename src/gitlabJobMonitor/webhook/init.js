const process = require("process")

module.exports = async function initWebhooks(api, config) {
    if (!config.publicUrl) {
        console.error("Configuration gitlab.webhook.publicUrl missing")
        process.exit(1)
    }
}
