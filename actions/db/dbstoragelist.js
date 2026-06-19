const { generateAccessToken } = require('@adobe/aio-sdk').Core.AuthClient;
const libDb = require('@adobe/aio-lib-db');

async function main(params) {
    let client;
    try {
        const token = await generateAccessToken(params);
        const db = await libDb.init({ token: token.access_token });
        client = await db.connect();
        const userCollection = await client.collection('users');
        const users = await userCollection.find({}).toArray();
        return {
            statusCode: 200,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                count: users.length,
                data: users
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