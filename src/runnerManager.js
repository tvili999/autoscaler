class RunnerManager {
    constructor(config) {
        this.types = config.types
        this.runners = new Map()
    }

    registerRunner(name, config) {
        const type = this.types.get(config.type)

        this.runners.set(name, {
            ...config,
            type
        })
    }

    setActive(runner) {

    }

    setIdle(runner) {

    }
}

module.exports = RunnerManager
