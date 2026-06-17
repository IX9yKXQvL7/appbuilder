const fetch = require('node-fetch')
const https = require('https')
const httpsAgent = new https.Agent({
    rejectUnauthorized: false
})
async function main(params) {
    try {
        const response = await fetch('https://emart.ddev.site/graphql', {
            method: 'POST',
            agent: httpsAgent,
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                query: "mutation CreateCustomer($input: CustomerCreateInput!) { createCustomerV2(input: $input) { customer { email dob is_subscribed } } }",
                variables: {
                    input: {
                        firstname: params.customer.first_name || 'TEST',
                        lastname: params.customer.last_name || 'TEST',
                        email: params.customer.email || 'test@gmail.com',
                        password: 'shubham@123',
                        dob: params.customer?.metafields?.dob || null,
                        is_subscribed: params.customer.accepts_marketing === true
                    }
                }
            })
        })
        const result = await response.json()
        return {
            statusCode: 200,
            headers: {
                'Content-Type': 'application/json'
            },
            body: result
        }
    } catch (err) {
        return {
            statusCode: 500,
            headers: {
                'Content-Type': 'application/json'
            },
            body: {
                error: err.message,
                data: params
            }
        }
    }
}

exports.main = main