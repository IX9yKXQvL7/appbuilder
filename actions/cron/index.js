const stateLib = require('@adobe/aio-lib-state')
const { Core } = require('@adobe/aio-sdk');
const now = () => new Date().toISOString()

async function main() {
    const logger = Core.Logger('database-delete', { level: 'info' })
    logger.info(`[${now()}] State listing cron started`)
    try {
        const state = await stateLib.init()
        for await (const { keys } of state.list()) {
            logger.info(`[${now()}] Fetched keys batch count: ${keys.length}`)
            for (const key of keys) {
                try {
                    logger.info(`[${now()}] State key found: ${key}`)
                } catch (e) {
                    logger.error(`[${now()}] Error logging key ${key}: ${e.message}`)
                }
            }
        }
        logger.info(`[${now()}] State listing cron completed`)
        return { statusCode: 200 }
    } catch (err) {
        logger.error(`[${now()}] Fatal error: ${err.message}`)
        return { statusCode: 500 }
    }
}
exports.main = main