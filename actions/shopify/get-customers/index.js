const fetch = require('node-fetch')

async function main(params) {
    try {
        let accessToken = params.accesstoken;
        let endpointUrl = params.endpointurl;
        if (!accessToken || !endpointUrl) {
            return {
                statusCode: 400,
                body: { error: JSON.parse(JSON.stringify(params)) },
                data : params
            }
        }
        let response = await fetch(
            endpointUrl, 
            { 
                method: 'GET',
                headers: { 
                    'Content-Type': 'application/json',
                    'X-Shopify-Access-Token': accessToken
                }
            }
        )
        console.log("Responce the shopify customer");
        console.log(response);
        let data = await response.json()
        return {
            statusCode: 200,
            body: {
                customers: data.customers || []
            }
        }
    } catch (err) {
        console.error('Runtime Failure:', err)
        return {
            statusCode: 500,
            body: {
                error: err.message || 'Fatal Node.js internal execution engine failure.',
                data : params
            }
        }
    }
}
exports.main = main