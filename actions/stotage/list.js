const stateLib = require('@adobe/aio-lib-state')

async function main(params) {
    try {
        const state = await stateLib.init(params)
        const results = []
        for await (const { keys } of state.list()) {
            for (const key of keys) {
                try {
                    const res = await state.get(key)
                    results.push({
                        key,
                        value: res && res.value ? safeJSONParse(res.value) : null
                    })
                } catch (e) {
                    results.push({
                        key,
                        value: null,
                        error: e.message
                    })
                }
            }
        }
        return {
            statusCode: 200,
            headers: { 'content-type': 'application/json' },
            body: JSON.stringify({
                success: true,
                data: results
            })
        }
    } catch (err) {
        return {
            statusCode: 500,
            headers: { 'content-type': 'application/json' },
            body: JSON.stringify({
                success: false,
                error: err.message
            })
        }
    }
}
function safeJSONParse(value) {
    try {
        return JSON.parse(value)
    } catch {
        return value
    }
}
exports.main = main