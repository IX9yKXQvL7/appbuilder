import React, { useState } from 'react'
import { Flex, Heading, ProgressCircle, Text, TextField, Button, Well, Divider, Picker, Item } from '@adobe/react-spectrum'
import actionWebInvoke from '../../utils'
import allActions from '../../config.json';
const productsearch = allActions['Adobe/adobe-product-search'];

function MagentoProductPricingRunner() {
    const [magentoUrl, setMagentoUrl] = useState('https://mcstaging.nazih.ae/graphql')
    const [sku, setSku] = useState('12570008004')
    const [viewMode, setViewMode] = useState('ui')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState(null)
    const [product, setProduct] = useState(null)
    const [rawJsonResponse, setRawJsonResponse] = useState(null)
    const [searched, setSearched] = useState(false)

    const handleFetchPricing = async () => {
        if (!magentoUrl.trim() || !sku.trim()) {
            setError('Please provide both the Magento GraphQL URL and a valid SKU.')
            return
        }

        setLoading(true)
        setError(null)
        setProduct(null)
        setRawJsonResponse(null)
        setSearched(true)

        try {
            const res = await actionWebInvoke(
                productsearch,
                {}, 
                {
                    endpoint: magentoUrl,
                    sku: sku
                }
            )

            setRawJsonResponse(res)

            if (res?.errors) {
                setError(res.errors[0]?.message || 'GraphQL execution error.')
            } else {
                const items = res?.data?.products?.items || []
                if (items.length > 0) {
                    setProduct(items[0])
                } else {
                    setProduct(null)
                }
            }
        } catch (err) {
            setError(err.message)
        } finally {
            setLoading(false)
        }
    }

    const formatPrice = (amount, currencyCode) => {
        if (amount === undefined || amount === null) return '—'
        return new Intl.NumberFormat('en-US', { style: 'currency', currency: currencyCode || 'USD' }).format(amount)
    }

    return (
        <Flex direction="column" margin="size-300" gap="size-200">
            <Heading level={1}>Adobe Product Master Dashboard</Heading>
            
            {/* Input Form Controls */}
            <Flex direction="row" gap="size-150" alignItems="end" wrap>
                <TextField
                    label="Magento GraphQL URL"
                    placeholder="https://your-domain.com/graphql"
                    value={magentoUrl}
                    onChange={setMagentoUrl}
                    width="size-4600"
                />
                <TextField
                    label="Target Product SKU"
                    value={sku}
                    onChange={setSku}
                    width="size-2400"
                />
                <Picker
                    label="Display Format"
                    selectedKey={viewMode}
                    onSelectionChange={setViewMode}
                    width="size-2000"
                >
                    <Item key="ui">Show Dashboard UI</Item>
                    <Item key="json">Show Raw JSON</Item>
                </Picker>
                <Button
                    variant="accent"
                    onPress={handleFetchPricing}
                    isDisabled={loading}
                >
                    Fetch Product Details
                </Button>
            </Flex>

            {loading && (
                <ProgressCircle isIndeterminate aria-label="Querying parameters..." />
            )}
            
            {error && (
                <Text UNSAFE_style={{ color: 'red', fontWeight: 'bold' }}>
                    Error: {error}
                </Text>
            )}

            {!loading && searched && !product && !error && (
                <Well><Text>No product found matching SKU: <strong>{sku}</strong></Text></Well>
            )}

            {/* Display Results */}
            {!loading && searched && !error && (
                <Flex direction="column" gap="size-200" marginTop="size-200">
                    
                    {/* OPTION 1: JSON DISPLAY MODE */}
                    {viewMode === 'json' && rawJsonResponse && (
                        <Well>
                            <Heading level={3} marginTop="0">Raw API JSON Payload</Heading>
                            <pre style={{ 
                                margin: 0, 
                                whiteSpace: 'pre-wrap', 
                                wordBreak: 'break-all',
                                fontFamily: 'monospace',
                                fontSize: '13px',
                                backgroundColor: '#f5f5f5',
                                padding: '10px',
                                borderRadius: '4px'
                            }}>
                                {JSON.stringify(rawJsonResponse, null, 2)}
                            </pre>
                        </Well>
                    )}

                    {/* OPTION 2: EXTENDED UI DISPLAY MODE */}
                    {viewMode === 'ui' && product && (
                        <Well>
                            <Flex direction="row" gap="size-300" wrap>
                                {/* Left Side: Product Thumbnail Image */}
                                {product.thumbnail?.url && (
                                    <img 
                                        src={product.thumbnail.url} 
                                        alt={product.thumbnail.label || product.name} 
                                        style={{ width: '120px', height: '120px', objectFit: 'contain', borderRadius: '4px', border: '1px solid #e1e1e1' }}
                                    />
                                )}
                                
                                {/* Core Metadata */}
                                <Flex direction="column" flex="1">
                                    <Heading level={2} marginTop="0" marginBottom="size-50">{product.name || 'Unnamed Product'}</Heading>
                                    <Text><strong>SKU:</strong> {product.sku || '—'} | <strong>Type:</strong> {product.type_id || '—'}</Text>
                                    <Text>
                                        <strong>Stock Status:</strong> {' '}
                                        <span style={{ color: product.stock_status === 'IN_STOCK' ? 'green' : 'red', fontWeight: 'bold' }}>
                                            {product.stock_status || 'UNKNOWN'}
                                        </span>
                                        {product.only_x_left_in_stock && ` (${product.only_x_left_in_stock} left!)`}
                                    </Text>
                                    {product.categories?.length > 0 && (
                                        <Text style={{ marginTop: '4px', fontSize: '13px' }}>
                                            <strong>Categories:</strong> {product.categories.map(cat => cat.name).join(', ')}
                                        </Text>
                                    )}
                                </Flex>
                            </Flex>

                            {/* Short Description Block */}
                            {product.short_description?.html && (
                                <div style={{ marginTop: '15px', fontSize: '13px', color: '#4b4b4b' }}>
                                    <div dangerouslySetInnerHTML={{ __html: product.short_description.html }} />
                                </div>
                            )}
                            
                            <Divider size="M" marginTop="size-200" marginBottom="size-200" />
                            
                            {/* Financial/Pricing Segment Matrices */}
                            {product.price_range && (
                                <Flex direction="row" gap="size-400" wrap>
                                    {/* Minimum Pricing Configurations */}
                                    {product.price_range.minimum_price && (
                                        <Flex direction="column" gap="size-50">
                                            <Heading level={4} marginBottom="size-50" UNSAFE_style={{ color: '#0265dc' }}>Minimum Customer Price</Heading>
                                            <Text><strong>Regular Price:</strong> {formatPrice(product.price_range.minimum_price.regular_price?.value, product.price_range.minimum_price.regular_price?.currency)}</Text>
                                            <Text><strong>Final Price:</strong> {formatPrice(product.price_range.minimum_price.final_price?.value, product.price_range.minimum_price.final_price?.currency)}</Text>
                                            
                                            {product.price_range.minimum_price.discount?.amount_off > 0 && (
                                                <Text UNSAFE_style={{ color: 'green', fontWeight: 'bold', marginTop: '4px' }}>
                                                    🎉 Save {formatPrice(product.price_range.minimum_price.discount.amount_off, product.price_range.minimum_price.regular_price?.currency)} ({product.price_range.minimum_price.discount.percent_off}%)
                                                </Text>
                                            )}
                                        </Flex>
                                    )}

                                    {/* Maximum Pricing Configurations */}
                                    {product.price_range.maximum_price && (
                                        <Flex direction="column" gap="size-50">
                                            <Heading level={4} marginBottom="size-50" UNSAFE_style={{ color: '#e07000' }}>Maximum Customer Price</Heading>
                                            <Text><strong>Regular Price:</strong> {formatPrice(product.price_range.maximum_price.regular_price?.value, product.price_range.maximum_price.regular_price?.currency)}</Text>
                                            <Text><strong>Final Price:</strong> {formatPrice(product.price_range.maximum_price.final_price?.value, product.price_range.maximum_price.final_price?.currency)}</Text>
                                        </Flex>
                                    )}
                                </Flex>
                            )}

                            {/* Optional Tier Pricing Block Breakdown */}
                            {product.price_tiers && product.price_tiers.length > 0 && (
                                <div style={{ marginTop: '20px' }}>
                                    <Heading level={4} marginBottom="size-50" UNSAFE_style={{ color: '#505050' }}>Bulk Volume Pricing Tiers</Heading>
                                    <Flex direction="column" gap="size-50" style={{ backgroundColor: '#f9f9f9', padding: '10px', borderRadius: '4px' }}>
                                        {product.price_tiers.map((tier, idx) => (
                                            <Text key={idx} style={{ fontSize: '13px' }}>
                                                • Buy <strong>{tier.quantity}</strong> or more for {' '}
                                                <strong>{formatPrice(tier.final_price?.value, tier.final_price?.currency)}</strong> each
                                            </Text>
                                        ))}
                                    </Flex>
                                </div>
                            )}
                        </Well>
                    )}
                </Flex>
            )}
        </Flex>
    )
}

export default MagentoProductPricingRunner