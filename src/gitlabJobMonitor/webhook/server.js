const process = require("process")
const express = require("express")
const bodyParser = require("body-parser")
const morgan = require("morgan");

module.exports = function setupExpress() {
    const server = express()

    server.use(bodyParser.json())

    const env = process.env["NODE_ENV"]
    server.use(morgan(env == "development" ? 'dev' : 'tiny'))

    return server
}

