const { generateAccessToken } = require('@adobe/aio-sdk').Core.AuthClient;
const libDb = require('@adobe/aio-lib-db');

async function main(params) {
    let client;
    try {
        const { id, name, email, phone, company, notes } = params;
        if (!id || !name || !email) {
            return {
                statusCode: 400,
                body: JSON.stringify({
                    error: 'id, name, and email are required'
                })
            };
        }
        // 2. Generate IMS access token
        const token = await generateAccessToken(params);
        // 3. Initialize 
        const db = await libDb.init({ token: token.access_token });
        client = await db.connect();
        // 4. Select collection
        const userCollection = await client.collection('users');
        // 5. Create document
        const userDoc = {
            id,
            name,
            email,
            phone: phone || null,
            company: company || null,
            notes: notes || null,
            createdAt: new Date().toISOString()
        };
        // 6. Insert data
        await userCollection.insertOne(userDoc);
        // 7. Success response
        return {
            statusCode: 201,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                success: true,
                data: userDoc,
                token : token
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