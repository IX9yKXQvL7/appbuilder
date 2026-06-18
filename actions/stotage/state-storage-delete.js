const stateLib = require('@adobe/aio-lib-state')

async function main(params) {
    try {
        const { id } = params
            if (!id) {
                return {
                    statusCode: 400,
                    body: JSON.stringify({
                    success: false,
                    error: 'id required'
                })
            }
        }
        const state = await stateLib.init()
        await state.delete(id)
        return {
            statusCode: 200,
            body: JSON.stringify({ success: true })
        }
    } catch (err) {
        return {
            statusCode: 500,
            body: JSON.stringify({ success: false, error: err.message })
        }
    }
}

exports.main = main