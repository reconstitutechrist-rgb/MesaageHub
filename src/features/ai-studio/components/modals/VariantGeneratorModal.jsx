import { useState } from 'react'
import { usePhoneTheme } from '@/context/PhoneThemeContext'
import { StudioIcons } from '../../utils/StudioIcons'
import { VARIANT_TYPES, VARIANT_COUNTS } from '../../utils/studioConstants'
import {
  useVariants,
  useSelectedVariantId,
  useIsGeneratingVariants,
  useVariantError,
  useVariantTypes,
  useVariantCount,
  useVariantActions,
} from '../../store/selectors'

/**
 * VariantGeneratorModal - Generate A/B design variants
 *
 * Allows users to generate multiple variations of their design
 * for A/B testing - headlines, color schemes, and layouts.
 */
export function VariantGeneratorModal({ isOpen, onClose, onApplyVariant }) {
  const { theme } = usePhoneTheme()
  const [activeTab, setActiveTab] = useState('generate')

  // Get state from store
  const variants = useVariants()
  const selectedVariantId = useSelectedVariantId()
  const isGenerating = useIsGeneratingVariants()
  const error = useVariantError()
  const variantTypes = useVariantTypes()
  const variantCount = useVariantCount()

  // Get actions
  const {
    setVariantTypes,
    setVariantCount,
    selectVariant,
    generateVariants,
    applyVariant,
    clearVariants,
  } = useVariantActions()

  // Toggle variant type selection
  const toggleVariantType = (typeId) => {
    if (variantTypes.includes(typeId)) {
      setVariantTypes(variantTypes.filter((t) => t !== typeId))
    } else {
      setVariantTypes([...variantTypes, typeId])
    }
  }

  // Handle generate
  const handleGenerate = async () => {
    await generateVariants()
    setActiveTab('compare')
  }

  // Handle apply variant
  const handleApply = () => {
    if (selectedVariantId && selectedVariantId !== 'original') {
      applyVariant(selectedVariantId)
      onApplyVariant?.()
      onClose()
    }
  }

  if (!isOpen) return null

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0,0,0,0.7)',
          zIndex: 1001,
        }}
      />

      {/* Modal */}
      <div
        style={{
          position: 'fixed',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          background: theme.isDark ? '#1a1a2e' : '#ffffff',
          borderRadius: '20px',
          padding: '24px',
          zIndex: 1002,
          width: '90%',
          maxWidth: '560px',
          maxHeight: '85vh',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 25px 50px rgba(0,0,0,0.4)',
        }}
      >
        {/* Header */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '20px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            {StudioIcons.copy(theme.accent, 24)}
            <h2 style={{ color: theme.text, fontSize: '18px', fontWeight: '700', margin: 0 }}>
              A/B Variant Generator
            </h2>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              padding: '4px',
            }}
          >
            {StudioIcons.x(theme.textMuted, 20)}
          </button>
        </div>

        {/* Tabs */}
        <div
          style={{
            display: 'flex',
            gap: '8px',
            marginBottom: '16px',
            borderBottom: `1px solid ${theme.cardBorder}`,
            paddingBottom: '12px',
          }}
        >
          <button
            onClick={() => setActiveTab('generate')}
            style={{
              padding: '8px 16px',
              borderRadius: '8px',
              border: 'none',
              background: activeTab === 'generate' ? theme.accent : 'transparent',
              color: activeTab === 'generate' ? '#fff' : theme.textMuted,
              fontSize: '13px',
              fontWeight: '500',
              cursor: 'pointer',
            }}
          >
            Generate
          </button>
          <button
            onClick={() => setActiveTab('compare')}
            disabled={variants.length === 0}
            style={{
              padding: '8px 16px',
              borderRadius: '8px',
              border: 'none',
              background: activeTab === 'compare' ? theme.accent : 'transparent',
              color:
                activeTab === 'compare'
                  ? '#fff'
                  : variants.length === 0
                    ? theme.cardBorder
                    : theme.textMuted,
              fontSize: '13px',
              fontWeight: '500',
              cursor: variants.length === 0 ? 'not-allowed' : 'pointer',
            }}
          >
            Compare ({variants.length})
          </button>
        </div>

        {/* Generate Tab */}
        {activeTab === 'generate' && (
          <div style={{ flex: 1, overflow: 'auto' }}>
            {/* Variant Types */}
            <div style={{ marginBottom: '20px' }}>
              <label
                style={{
                  color: theme.text,
                  fontSize: '13px',
                  fontWeight: '600',
                  marginBottom: '10px',
                  display: 'block',
                }}
              >
                What to vary?
              </label>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {VARIANT_TYPES.map((type) => {
                  const isSelected = variantTypes.includes(type.id)
                  return (
                    <button
                      key={type.id}
                      onClick={() => toggleVariantType(type.id)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                        padding: '12px',
                        borderRadius: '10px',
                        border: isSelected
                          ? `2px solid ${theme.accent}`
                          : `1px solid ${theme.cardBorder}`,
                        background: isSelected ? `${theme.accent}10` : 'transparent',
                        cursor: 'pointer',
                        textAlign: 'left',
                      }}
                    >
                      {/* Checkbox */}
                      <div
                        style={{
                          width: '20px',
                          height: '20px',
                          borderRadius: '4px',
                          border: isSelected ? 'none' : `2px solid ${theme.cardBorder}`,
                          background: isSelected ? theme.accent : 'transparent',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0,
                        }}
                      >
                        {isSelected && StudioIcons.check('#fff', 14)}
                      </div>

                      {/* Icon */}
                      <div
                        style={{
                          width: '36px',
                          height: '36px',
                          borderRadius: '8px',
                          background: theme.cardBg,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0,
                        }}
                      >
                        {type.icon === 'type' && StudioIcons.type(theme.accent, 18)}
                        {type.icon === 'palette' && StudioIcons.palette(theme.accent, 18)}
                        {type.icon === 'layout' && StudioIcons.grid(theme.accent, 18)}
                      </div>

                      {/* Text */}
                      <div>
                        <div style={{ color: theme.text, fontSize: '14px', fontWeight: '500' }}>
                          {type.name}
                        </div>
                        <div style={{ color: theme.textMuted, fontSize: '12px' }}>
                          {type.description}
                        </div>
                      </div>
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Variant Count */}
            <div style={{ marginBottom: '20px' }}>
              <label
                style={{
                  color: theme.text,
                  fontSize: '13px',
                  fontWeight: '600',
                  marginBottom: '10px',
                  display: 'block',
                }}
              >
                How many variants?
              </label>
              <div style={{ display: 'flex', gap: '8px' }}>
                {VARIANT_COUNTS.map((count) => (
                  <button
                    key={count}
                    onClick={() => setVariantCount(count)}
                    style={{
                      flex: 1,
                      padding: '12px',
                      borderRadius: '10px',
                      border:
                        variantCount === count
                          ? `2px solid ${theme.accent}`
                          : `1px solid ${theme.cardBorder}`,
                      background: variantCount === count ? `${theme.accent}10` : 'transparent',
                      color: variantCount === count ? theme.accent : theme.text,
                      fontSize: '16px',
                      fontWeight: '600',
                      cursor: 'pointer',
                    }}
                  >
                    {count}
                  </button>
                ))}
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div
                style={{
                  padding: '12px',
                  borderRadius: '8px',
                  background: 'rgba(239, 68, 68, 0.1)',
                  color: '#ef4444',
                  fontSize: '13px',
                  marginBottom: '16px',
                }}
              >
                {error}
              </div>
            )}

            {/* Generate Button */}
            <button
              onClick={handleGenerate}
              disabled={isGenerating || variantTypes.length === 0}
              style={{
                width: '100%',
                padding: '16px',
                borderRadius: '12px',
                border: 'none',
                background:
                  isGenerating || variantTypes.length === 0
                    ? theme.cardBg
                    : `linear-gradient(135deg, ${theme.gradientStart}, ${theme.gradientEnd})`,
                color: isGenerating || variantTypes.length === 0 ? theme.textMuted : '#fff',
                fontSize: '15px',
                fontWeight: '600',
                cursor: isGenerating || variantTypes.length === 0 ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '10px',
              }}
            >
              {isGenerating ? (
                <>
                  <div
                    style={{
                      width: '18px',
                      height: '18px',
                      border: '2px solid currentColor',
                      borderTopColor: 'transparent',
                      borderRadius: '50%',
                      animation: 'spin 1s linear infinite',
                    }}
                  />
                  Generating {variantCount} variants...
                </>
              ) : (
                <>
                  {StudioIcons.sparkles('#fff', 18)}
                  Generate {variantCount} Variants
                </>
              )}
            </button>
          </div>
        )}

        {/* Compare Tab */}
        {activeTab === 'compare' && (
          <div style={{ flex: 1, overflow: 'auto' }}>
            {/* Variant Grid */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))',
                gap: '12px',
                marginBottom: '16px',
              }}
            >
              {variants.map((variant) => {
                const isSelected = selectedVariantId === variant.id
                return (
                  <button
                    key={variant.id}
                    onClick={() => selectVariant(variant.id)}
                    style={{
                      padding: '12px',
                      borderRadius: '12px',
                      border: isSelected
                        ? `2px solid ${theme.accent}`
                        : `1px solid ${theme.cardBorder}`,
                      background: isSelected ? `${theme.accent}10` : theme.cardBg,
                      cursor: 'pointer',
                      textAlign: 'left',
                    }}
                  >
                    {/* Label */}
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        marginBottom: '8px',
                      }}
                    >
                      <span
                        style={{
                          color: variant.isOriginal ? theme.textMuted : theme.text,
                          fontSize: '12px',
                          fontWeight: '600',
                        }}
                      >
                        {variant.label}
                      </span>
                      {variant.isOriginal && (
                        <span
                          style={{
                            padding: '2px 6px',
                            borderRadius: '4px',
                            background: theme.cardBorder,
                            color: theme.textMuted,
                            fontSize: '10px',
                          }}
                        >
                          Current
                        </span>
                      )}
                    </div>

                    {/* Headline Preview */}
                    {variant.headline && (
                      <div
                        style={{
                          color: theme.text,
                          fontSize: '13px',
                          fontWeight: '500',
                          marginBottom: '8px',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical',
                          lineHeight: 1.3,
                        }}
                      >
                        {variant.headline}
                      </div>
                    )}

                    {/* Color Preview */}
                    {variant.colors && (
                      <div style={{ display: 'flex', gap: '4px' }}>
                        {Object.values(variant.colors)
                          .slice(0, 4)
                          .map((color, i) => (
                            <div
                              key={i}
                              style={{
                                width: '20px',
                                height: '20px',
                                borderRadius: '4px',
                                background: color,
                                border: `1px solid ${theme.cardBorder}`,
                              }}
                            />
                          ))}
                      </div>
                    )}
                  </button>
                )
              })}
            </div>

            {/* Action Buttons */}
            <div style={{ display: 'flex', gap: '12px' }}>
              <button
                onClick={clearVariants}
                style={{
                  flex: 1,
                  padding: '14px',
                  borderRadius: '10px',
                  border: `1px solid ${theme.cardBorder}`,
                  background: 'transparent',
                  color: theme.textMuted,
                  fontSize: '14px',
                  fontWeight: '500',
                  cursor: 'pointer',
                }}
              >
                Clear All
              </button>
              <button
                onClick={handleApply}
                disabled={!selectedVariantId || selectedVariantId === 'original'}
                style={{
                  flex: 2,
                  padding: '14px',
                  borderRadius: '10px',
                  border: 'none',
                  background:
                    !selectedVariantId || selectedVariantId === 'original'
                      ? theme.cardBg
                      : `linear-gradient(135deg, ${theme.gradientStart}, ${theme.gradientEnd})`,
                  color:
                    !selectedVariantId || selectedVariantId === 'original'
                      ? theme.textMuted
                      : '#fff',
                  fontSize: '14px',
                  fontWeight: '600',
                  cursor:
                    !selectedVariantId || selectedVariantId === 'original'
                      ? 'not-allowed'
                      : 'pointer',
                }}
              >
                Apply Selected Variant
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Keyframe for spinner */}
      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </>
  )
}

export default VariantGeneratorModal
