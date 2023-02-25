const fs = require("fs");
const process = require("process")

if (!fs.existsSync("./config.json")) {
    console.error("Configuration file 'config.json' not found.")
    process.exit(1)
}

const configRaw = fs.readFileSync("./config.json")
let config;

try {
    config = JSON.parse(configRaw)
}
catch (e) {
    console.error("Unable to parse config file")
    console.error(e)
    process.exit(1)
}

module.exports = config