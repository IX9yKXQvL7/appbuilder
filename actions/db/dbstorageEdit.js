const { generateAccessToken } = require('@adobe/aio-sdk').Core.AuthClient;
const libDb = require('@adobe/aio-lib-db');

async function main(params) {
    let client;
    try {
        const { id, name, email, phone, company, notes } = params;
        if (!id) {
            return {
                statusCode: 400,
                    body: JSON.stringify({
                    error: 'id is required for update'
                })
            };
        }
        const token = await generateAccessToken(params);
        const db = await libDb.init({ token: token.access_token });
        client = await db.connect();
        const userCollection = await client.collection('users');
        const updateData = {
            ...(name && { name }),
            ...(email && { email }),
            ...(phone !== undefined && { phone }),
            ...(company !== undefined && { company }),
            ...(notes !== undefined && { notes }),
            updatedAt: new Date().toISOString()
        };
        const result = await userCollection.updateOne(
            { id },
            { $set: updateData }
        );
        if (result.matchedCount === 0) {
            return {
                statusCode: 404,
                    body: JSON.stringify({
                    error: 'Record not found'
                })
            };
        }
        return {
            statusCode: 200,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                success: true,
                message: 'Record updated successfully',
                id,
                updatedFields: updateData
            })
        };
    } catch (error) {
        if (error.name === 'DbError') {
            return {
                statusCode: 500,
                body: JSON.stringify({
                error: 'Database error',
                message: error.message
                })
            };
        }

        return {
            statusCode: 500,
            body: JSON.stringify({
                error: 'Unexpected error',
                message: error.message
            })
        };
    } finally {
        if (client) {
            await client.close();
        }
    }
}

exports.main = main;