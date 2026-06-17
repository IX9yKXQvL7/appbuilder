const fetch = require('node-fetch')

async function main(params) {
    const { endpoint, sku } = params
    if (!endpoint || !sku) {
        return {
            statusCode: 400,
            headers: { 'Content-Type': 'application/json' },
            body: { 
                error: `Missing required field: ${!endpoint ? "'endpoint'" : "'sku'"}.`,
                data : params
            }
        }
    }
    const PRICING_QUERY = `query GetProductFullData($sku:String!){products(filter:{sku:{eq:$sku}}){total_count items{id uid name sku type_id attribute_set_id status visibility created_at updated_at description{html} short_description{html} url_key url_suffix canonical_url price_range{minimum_price{regular_price{value currency}final_price{value currency}discount{amount_off percent_off}}maximum_price{regular_price{value currency}final_price{value currency}}}price_tiers{quantity final_price{value currency}}stock_status only_x_left_in_stock image{url label}small_image{url label}thumbnail{url label}media_gallery{url label position disabled}meta_title meta_description meta_keyword categories{id uid name url_key url_path level}rating_summary review_count new_from_date new_to_date special_from_date special_to_date}}}`
    try {
        const response = await fetch(endpoint, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
            body: JSON.stringify({ query: PRICING_QUERY, variables: { sku: sku.trim() } })
        })
        const jsonResponse = await response.json()
        return {
            statusCode: response.status || 200,
            headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
            body: jsonResponse
        }
    } catch (error) {
        return {
            statusCode: 500,
            headers: { 'Content-Type': 'application/json' },
            body: { error: "GraphQL Proxy Request Failed", details: error.message }
        }
    }
}
exports.main = main