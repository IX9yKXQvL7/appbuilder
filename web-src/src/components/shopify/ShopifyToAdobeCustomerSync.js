import React, { useState } from 'react'
import {
    Flex,
    Heading,
    ProgressCircle,
    TableView,
    TableHeader,
    Column,
    TableBody,
    Row,
    Cell,
    Text,
    TextField,
    Button
} from '@adobe/react-spectrum'
import actionWebInvoke from '../../utils'

function ShopifyToAdobeCustomerSync() {
    const [customers, setCustomers] = useState([])
    const [loading, setLoading] = useState(false)
    const [bulkSyncing, setBulkSyncing] = useState(false)
    const [error, setError] = useState(null)
    const [hasSearched, setHasSearched] = useState(false)
    const [apiUrl, setApiUrl] = useState('https://m2migration.myshopify.com/admin/api/2026-01/customers.json')
    const [accessToken, setAccessToken] = useState('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')
    const [syncingId, setSyncingId] = useState(null)
    const [isConfigSaved, setIsConfigSaved] = useState(false)
    const [selectedKeys, setSelectedKeys] = useState(new Set())

    const handleFetchCustomers = async () => {
        if (!apiUrl.trim()) {
            setError('Please provide a valid Shopify API Base URL.')
            return
        }
        if (!accessToken.trim()) {
            setError('Please provide a valid Shopify Access Token.')
            return
        }
        setLoading(true)
        setError(null)
        setHasSearched(true)
        setSelectedKeys(new Set())
        try {
            const res = await actionWebInvoke(
                'api/v1/web/Adobe/shopify-get-customers',
                {},
                {
                    endpointurl: apiUrl.trim(),
                    accesstoken: accessToken.trim(),
                    persistToDb: true
                }
            )
            if (res?.error) {
                setError(res.error)
                setCustomers([])
            } else {
                setCustomers(res.customers || [])
            }
        } catch (err) {
            setError(err.message)
            setCustomers([])
        } finally {
            setLoading(false)
        }
    }

    const handleSyncToAdobe = async (customer) => {
        const customerId = String(customer.id)
        setSyncingId(customerId)
    
        try {
            const res = await actionWebInvoke(
                'api/v1/web/Adobe/magento-customers-graphql',
                {},
                { customer }
            )
    
            if (res?.body?.error) {
                alert(`Sync failed: ${res.body.error}`)
                return
            }
    
            // ✅ success → update UI
            setCustomers(prev =>
                prev.map(c =>
                    String(c.id) === customerId
                        ? { ...c, is_synced: true }
                        : c
                )
            )
    
            alert(`Customer ${customer.email || 'Record'} successfully synced to Adobe!`)
    
        } catch (err) {
            // ✅ THIS is where 400 / message/http errors come
            alert(`Execution error: ${err.message}`)
            console.error('Sync error:', err)
        } finally {
            // ✅ ALWAYS reset UI state
            setSyncingId(null)
        }
    }

    return (
        <Flex direction="column" margin="size-300" gap="size-200">
            <Heading level={1}>Customers</Heading>
            <Flex direction="row" gap="size-150" alignItems="end" wrap>
                <TextField
                    label="Shopify API Customer Endpoint URL"
                    placeholder="https://your-store.myshopify.com/admin/api/2024-01/customers.json"
                    value={apiUrl}
                    onChange={setApiUrl}
                    width="size-4600"
                    isDisabled={isConfigSaved}
                />
                <TextField
                    label="X-Shopify-Access-Token"
                    placeholder={isConfigSaved ? 'Using saved credential database...' : 'shpat_...'}
                    value={accessToken}
                    onChange={setAccessToken}
                    type="password"
                    width="size-3600"
                    isDisabled={isConfigSaved}
                />
                <Button variant="accent" onPress={handleFetchCustomers} isDisabled={loading || bulkSyncing} >Save & Connect</Button>
            </Flex>
            {(loading || bulkSyncing) && (
                <ProgressCircle isIndeterminate aria-label="Loading..." />
            )}
            {!loading && error && (
                <Text UNSAFE_style={{ color: 'red', fontWeight: 'bold' }}>
                    {error}
                </Text>
            )}
            {!loading && !error && hasSearched && customers.length === 0 && (
                <Text>No customers found.</Text>
            )}
            {!loading && customers.length > 0 && (
                <TableView
                    aria-label="Shopify Customers Table"
                    selectionMode="multiple"
                    selectedKeys={selectedKeys}
                    onSelectionChange={setSelectedKeys}
                    UNSAFE_style={{ minWidth: '100%' }}
                >
                    <TableHeader>
                        <Column key="first_name">First Name</Column>
                        <Column key="last_name">Last Name</Column>
                        <Column key="email">Email</Column>
                        <Column key="city">City</Column>
                        <Column key="synced" align="center">Synced</Column>
                        <Column key="actions" align="center">Actions</Column>
                    </TableHeader>

                    <TableBody>
                        {customers.map((c, idx) => (
                            <Row key={String(c.id || idx)}>
                                <Cell>{c.first_name || '—'}</Cell>
                                <Cell>{c.last_name || '—'}</Cell>
                                <Cell>{c.email || '—'}</Cell>
                                <Cell>{c.default_address?.city || '—'}</Cell>

                                {/* ✔️ / ❌ indicator */}
                                <Cell align="center">
                                    {c.is_synced ? '✔️' : '❌'}
                                </Cell>

                                <Cell>
                                    <Button
                                        variant="primary"
                                        isDisabled={c.is_synced || syncingId !== null || bulkSyncing}
                                        onPress={() => handleSyncToAdobe(c)}
                                    >
                                        {c.is_synced
                                            ? 'Synced'
                                            : syncingId === c.id
                                            ? 'Syncing...'
                                            : 'Sync to Adobe'}
                                    </Button>
                                </Cell>
                            </Row>
                        ))}
                    </TableBody>
                </TableView>
            )}
        </Flex>
    )
}
export default ShopifyToAdobeCustomerSync