const stateLib = require('@adobe/aio-lib-state')

async function main(params) {
    try {
        const {id, name, email, phone, company, notes, createdAt } = params
        if (!id || !name || !email) {
            return {
                statusCode: 400,
                headers: { 'content-type': 'application/json' },
                body: JSON.stringify({
                    success: false,
                    error: 'id, name, and email are required'
                })
            }
        }
        // 3️⃣ Init State (runtime credentials)
        const state = await stateLib.init()
        // 4️⃣ Prepare data to store
        const dataToStore = {
            id,
            name,
            email,
            phone: phone || null,
            company: company || null,
            notes: notes || null,
            createdAt: createdAt || new Date().toISOString()
        }
        // 5️⃣ Store data
        await state.put(id, JSON.stringify(dataToStore))
        return {
            statusCode: 200,
            headers: { 'content-type': 'application/json' },
            body: JSON.stringify({
                success: true,
                message: 'Data stored successfully',
                key: id
            })
        }
    } catch (error) {
        return {
            statusCode: 500,
            headers: { 'content-type': 'application/json' },
            body: JSON.stringify({
                success: false,
                error: error.message
            })
        }
    }
}
exports.main = main