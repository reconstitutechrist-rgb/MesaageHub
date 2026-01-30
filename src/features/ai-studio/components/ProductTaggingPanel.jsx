import { useState, useEffect } from 'react'
import { usePhoneTheme } from '@/context/PhoneThemeContext'
import { StudioIcons } from '../utils/StudioIcons'
import {
  useProductCatalog,
  useProductTagLayers,
  useProductActions,
  useLayerActions,
} from '../store/selectors'

/**
 * ProductTaggingPanel - Collapsible panel for managing product tags on canvas
 *
 * Sections:
 * 1. Product catalog management (add/remove products)
 * 2. Add product tags to canvas from catalog
 * 3. Active tags on canvas with remove buttons
 */
export function ProductTaggingPanel() {
  const { theme } = usePhoneTheme()
  const [isExpanded, setIsExpanded] = useState(false)
  const [showAddForm, setShowAddForm] = useState(false)
  const [formData, setFormData] = useState({ name: '', sku: '', price: '', productUrl: '' })

  const catalog = useProductCatalog()
  const tagLayers = useProductTagLayers()
  const { saveProduct, deleteProduct, loadProductCatalog } = useProductActions()
  const { addProductTagLayer, removeLayer } = useLayerActions()

  // Load catalog on first expand
  useEffect(() => {
    if (isExpanded && catalog.length === 0) {
      loadProductCatalog('demo-user')
    }
  }, [isExpanded, catalog.length, loadProductCatalog])

  const handleAddProduct = async () => {
    if (!formData.name.trim()) return
    await saveProduct('demo-user', {
      name: formData.name.trim(),
      sku: formData.sku.trim(),
      price: formData.price ? parseFloat(formData.price) : null,
      productUrl: formData.productUrl.trim(),
    })
    setFormData({ name: '', sku: '', price: '', productUrl: '' })
    setShowAddForm(false)
  }

  const handleTagProduct = (product) => {
    addProductTagLayer(product)
  }

  const handleRemoveTag = (layerId) => {
    removeLayer(layerId)
  }

  const handleDeleteProduct = async (productId) => {
    await deleteProduct('demo-user', productId)
  }

  return (
    <div>
      {/* Header - toggle expand/collapse */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          width: '100%',
          padding: '12px 0',
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          color: theme.text,
        }}
      >
        <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {StudioIcons.tag(theme.accent, 18)}
          <span style={{ fontSize: '14px', fontWeight: '600' }}>Product Tags</span>
          {tagLayers.length > 0 && (
            <span
              style={{
                padding: '2px 6px',
                borderRadius: '8px',
                background: theme.accent + '20',
                color: theme.accent,
                fontSize: '10px',
                fontWeight: '600',
              }}
            >
              {tagLayers.length}
            </span>
          )}
        </span>
        {isExpanded
          ? StudioIcons.chevronUp(theme.textMuted, 16)
          : StudioIcons.chevronDown(theme.textMuted, 16)}
      </button>

      {isExpanded && (
        <div
          style={{ display: 'flex', flexDirection: 'column', gap: '12px', paddingBottom: '12px' }}
        >
          {/* Product Catalog */}
          <div>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: '8px',
              }}
            >
              <span style={{ color: theme.textMuted, fontSize: '11px', fontWeight: '500' }}>
                PRODUCT CATALOG
              </span>
              <button
                onClick={() => setShowAddForm(!showAddForm)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  padding: '4px 8px',
                  borderRadius: '6px',
                  border: 'none',
                  background: theme.accent + '20',
                  color: theme.accent,
                  fontSize: '11px',
                  fontWeight: '500',
                  cursor: 'pointer',
                }}
              >
                {StudioIcons.plus(theme.accent, 12)} Add
              </button>
            </div>

            {/* Add Product Form */}
            {showAddForm && (
              <div
                style={{
                  padding: '10px',
                  borderRadius: '10px',
                  background: theme.cardBg,
                  marginBottom: '8px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '6px',
                }}
              >
                <input
                  type="text"
                  placeholder="Product name *"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  style={{
                    padding: '8px 10px',
                    borderRadius: '6px',
                    border: `1px solid ${theme.cardBorder}`,
                    background: theme.isDark ? '#0f0f23' : '#f8f9fa',
                    color: theme.text,
                    fontSize: '12px',
                    outline: 'none',
                  }}
                />
                <div style={{ display: 'flex', gap: '6px' }}>
                  <input
                    type="text"
                    placeholder="SKU"
                    value={formData.sku}
                    onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                    style={{
                      flex: 1,
                      padding: '8px 10px',
                      borderRadius: '6px',
                      border: `1px solid ${theme.cardBorder}`,
                      background: theme.isDark ? '#0f0f23' : '#f8f9fa',
                      color: theme.text,
                      fontSize: '12px',
                      outline: 'none',
                    }}
                  />
                  <input
                    type="number"
                    placeholder="Price"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    style={{
                      flex: 1,
                      padding: '8px 10px',
                      borderRadius: '6px',
                      border: `1px solid ${theme.cardBorder}`,
                      background: theme.isDark ? '#0f0f23' : '#f8f9fa',
                      color: theme.text,
                      fontSize: '12px',
                      outline: 'none',
                    }}
                  />
                </div>
                <input
                  type="text"
                  placeholder="Product URL"
                  value={formData.productUrl}
                  onChange={(e) => setFormData({ ...formData, productUrl: e.target.value })}
                  style={{
                    padding: '8px 10px',
                    borderRadius: '6px',
                    border: `1px solid ${theme.cardBorder}`,
                    background: theme.isDark ? '#0f0f23' : '#f8f9fa',
                    color: theme.text,
                    fontSize: '12px',
                    outline: 'none',
                  }}
                />
                <div style={{ display: 'flex', gap: '6px' }}>
                  <button
                    onClick={handleAddProduct}
                    disabled={!formData.name.trim()}
                    style={{
                      flex: 1,
                      padding: '8px',
                      borderRadius: '6px',
                      border: 'none',
                      background: formData.name.trim() ? theme.accent : theme.cardBorder,
                      color: '#fff',
                      fontSize: '12px',
                      fontWeight: '600',
                      cursor: formData.name.trim() ? 'pointer' : 'not-allowed',
                    }}
                  >
                    Save Product
                  </button>
                  <button
                    onClick={() => setShowAddForm(false)}
                    style={{
                      padding: '8px 12px',
                      borderRadius: '6px',
                      border: 'none',
                      background: theme.cardBg,
                      color: theme.textMuted,
                      fontSize: '12px',
                      cursor: 'pointer',
                    }}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}

            {/* Product List */}
            {catalog.length === 0 ? (
              <div
                style={{
                  padding: '16px',
                  borderRadius: '10px',
                  background: theme.cardBg,
                  textAlign: 'center',
                }}
              >
                <span style={{ color: theme.textMuted, fontSize: '12px' }}>
                  No products yet. Add products to tag them in your designs.
                </span>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                {catalog.map((product) => (
                  <div
                    key={product.id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '8px 10px',
                      borderRadius: '8px',
                      background: theme.cardBg,
                    }}
                  >
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div
                        style={{
                          color: theme.text,
                          fontSize: '12px',
                          fontWeight: '500',
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                        }}
                      >
                        {product.name}
                      </div>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        {product.price !== null && product.price !== undefined && (
                          <span
                            style={{ color: theme.accent, fontSize: '10px', fontWeight: '600' }}
                          >
                            ${Number(product.price).toFixed(2)}
                          </span>
                        )}
                        {product.sku && (
                          <span style={{ color: theme.textMuted, fontSize: '10px' }}>
                            {product.sku}
                          </span>
                        )}
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: '4px' }}>
                      <button
                        onClick={() => handleTagProduct(product)}
                        title="Add tag to canvas"
                        style={{
                          padding: '4px 8px',
                          borderRadius: '6px',
                          border: 'none',
                          background: theme.accent,
                          color: '#fff',
                          fontSize: '10px',
                          fontWeight: '600',
                          cursor: 'pointer',
                        }}
                      >
                        Tag
                      </button>
                      <button
                        onClick={() => handleDeleteProduct(product.id)}
                        title="Delete product"
                        style={{
                          padding: '4px',
                          borderRadius: '6px',
                          border: 'none',
                          background: 'transparent',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                        }}
                      >
                        {StudioIcons.trash('#ef4444', 14)}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Active Tags on Canvas */}
          {tagLayers.length > 0 && (
            <div>
              <span
                style={{
                  color: theme.textMuted,
                  fontSize: '11px',
                  fontWeight: '500',
                  display: 'block',
                  marginBottom: '8px',
                }}
              >
                ACTIVE TAGS ON CANVAS
              </span>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                {tagLayers.map((layer) => (
                  <div
                    key={layer.id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '6px 10px',
                      borderRadius: '8px',
                      background: theme.cardBg,
                      border: `1px solid ${theme.cardBorder}`,
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <div
                        style={{
                          width: '8px',
                          height: '8px',
                          borderRadius: '50%',
                          background: layer.data.dotColor || '#3b82f6',
                        }}
                      />
                      <span
                        style={{
                          color: theme.text,
                          fontSize: '11px',
                          fontWeight: '500',
                        }}
                      >
                        {layer.data.productName || 'Unnamed Product'}
                      </span>
                      {layer.data.productPrice !== null &&
                        layer.data.productPrice !== undefined && (
                          <span
                            style={{ color: theme.accent, fontSize: '10px', fontWeight: '600' }}
                          >
                            ${Number(layer.data.productPrice).toFixed(2)}
                          </span>
                        )}
                    </div>
                    <button
                      onClick={() => handleRemoveTag(layer.id)}
                      title="Remove tag"
                      style={{
                        padding: '2px',
                        borderRadius: '4px',
                        border: 'none',
                        background: 'transparent',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                      }}
                    >
                      {StudioIcons.x(theme.textMuted, 14)}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default ProductTaggingPanel
