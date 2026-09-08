const NAME_PREFIX = 'ADOBE API ';

/**
 * Prefix a product name with "test " without hardcoding the original value.
 * JavaScript strings are Unicode, so Arabic names are preserved as-is.
 */
function prefixProductName(name) {
    if (name == null || name === '') {
        return name;
    }

    const originalName = String(name);

    if (originalName.startsWith(NAME_PREFIX)) {
        return originalName;
    }
    return NAME_PREFIX + originalName;
}

/**
 * Magento GraphQL is proxied through JsonSchema as `getProductByGraphql { data: JSON }`.
 * Nested Magento types are not in the Mesh schema, so the name field is transformed
 * on the JSON payload. Other product fields (sku, media_gallery, price, etc.) are copied unchanged.
 */
function prefixNamesInMagentoGraphqlData(data) {
    if (!data || typeof data !== 'object') {
        return data;
    }

    const products = data.products;
    if (!products || !Array.isArray(products.items)) {
        return data;
    }

    return {
        ...data,
        products: {
            ...products,
            items: products.items.map((item) => {
                if (!item || typeof item !== 'object') {
                    return item;
                }

                return {
                    ...item,
                    name: prefixProductName(item.name),
                };
            }),
        },
    };
}

module.exports = {
    resolvers: {
        Query: {
            getProductByGraphql: {
                selectionSet: '{ data }',
                resolve: async (root, args, context, info) => {
                    const sourceQuery =
                        context.Adobe_Commerce_GRAPHAL &&
                        context.Adobe_Commerce_GRAPHAL.Query;

                    if (!sourceQuery || typeof sourceQuery.getProductByGraphql !== 'function') {
                        return {
                            data: prefixNamesInMagentoGraphqlData(root && root.data),
                        };
                    }

                    const result = await sourceQuery.getProductByGraphql({
                        root,
                        args,
                        context,
                        info,
                    });

                    if (!result) {
                        return result;
                    }

                    return {
                        ...result,
                        data: prefixNamesInMagentoGraphqlData(result.data),
                    };
                },
            },
        },
        query_getProductByGraphql: {
            data: {
                resolve: (root) => prefixNamesInMagentoGraphqlData(root && root.data),
            },
        },
    },
};
