async function main(params) {
    const { customers, steps = [] } = params;
    return {
        statusCode: 200,
        headers: {
            'Content-Type': 'application/json'
        },
        body: {
            steps: [...steps, 'step3'],
            customers
        }
    };
}
exports.main = main;