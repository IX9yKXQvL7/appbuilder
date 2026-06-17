async function main(params) {
    const customers = [
        { id: 1, name: 'Ravi', active: true },
        { id: 2, name: 'Amit', active: true },
        { id: 3, name: 'Neha', active: true }
    ];
    return {
        ...params,
        step: 'step1',
        steps: ['step1'],
        customers
    };
}
exports.main = main;