async function main(params) {
    const { customers, steps = [] } = params;
    const processedCustomers = customers.filter(c => c.active);
    return {
        ...params,
        step: 'step2',
        steps: [...steps, 'step2'],
        customers: processedCustomers
    };
}
exports.main = main;