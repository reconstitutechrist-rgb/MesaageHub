import { useState, useMemo } from 'react'
import { usePhoneTheme } from '@/context/PhoneThemeContext'
import { StudioIcons } from '../../utils/StudioIcons'
import { platformPresets } from '@/lib/platformTemplates'
import {
  PLATFORM_GROUPS,
  generateMultiPlatformExports,
  checkAdaptationComplexity,
  getRecommendedPlatforms,
} from '../../utils/crossPlatformAdapter'
import { useLayers, useSelectedPlatform } from '../../store/selectors'

/**
 * MultiPlatformExportModal - Export design to multiple platforms at once
 *
 * Allows users to select multiple target platforms and preview how their
 * design will adapt to each format before exporting.
 */
export function MultiPlatformExportModal({ isOpen, onClose, onExport }) {
  const { theme } = usePhoneTheme()
  const layers = useLayers()
  const currentPlatform = useSelectedPlatform()

  const [selectedPlatforms, setSelectedPlatforms] = useState([])
  const [isExporting, setIsExporting] = useState(false)
  const [exportProgress, setExportProgress] = useState(0)
  const [activeTab, setActiveTab] = useState('recommended')

  // Get recommended platforms based on current design
  const recommendations = useMemo(() => {
    return getRecommendedPlatforms(currentPlatform)
  }, [currentPlatform])

  // All available platforms
  const allPlatforms = useMemo(() => {
    return Object.entries(platformPresets)
      .filter(([id]) => id !== 'custom' && id !== currentPlatform)
      .map(([id, preset]) => ({
        id,
        ...preset,
        complexity: checkAdaptationComplexity(layers, currentPlatform, id),
      }))
  }, [layers, currentPlatform])

  // Toggle platform selection
  const togglePlatform = (platformId) => {
    setSelectedPlatforms((prev) =>
      prev.includes(platformId) ? prev.filter((id) => id !== platformId) : [...prev, platformId]
    )
  }

  // Select a preset group
  const selectGroup = (groupId) => {
    const group = PLATFORM_GROUPS[groupId]
    if (group) {
      const validPlatforms = group.platforms.filter((p) => p !== currentPlatform)
      setSelectedPlatforms(validPlatforms)
    }
  }

  // Clear all selections
  const clearSelection = () => {
    setSelectedPlatforms([])
  }

  // Handle export
  const handleExport = async () => {
    if (selectedPlatforms.length === 0) return

    setIsExporting(true)
    setExportProgress(0)

    try {
      const exports = generateMultiPlatformExports(layers, currentPlatform, selectedPlatforms)

      for (let i = 0; i < exports.length; i++) {
        await onExport(exports[i])
        setExportProgress(((i + 1) / exports.length) * 100)
      }

      onClose()
    } catch (error) {
      console.error('Multi-platform export failed:', error)
    } finally {
      setIsExporting(false)
    }
  }

  if (!isOpen) return null

  const getComplexityColor = (complexity) => {
    switch (complexity) {
      case 'simple':
        return '#22c55e'
      case 'moderate':
        return '#f59e0b'
      case 'complex':
        return '#ef4444'
      default:
        return theme.textMuted
    }
  }

  const getComplexityLabel = (complexity) => {
    switch (complexity) {
      case 'simple':
        return 'Perfect fit'
      case 'moderate':
        return 'Minor adjustments'
      case 'complex':
        return 'May need review'
      default:
        return ''
    }
  }

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
          maxWidth: '500px',
          maxHeight: '80vh',
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
            {StudioIcons.multiPlatform(theme.accent, 24)}
            <h2 style={{ color: theme.text, fontSize: '18px', fontWeight: '700', margin: 0 }}>
              Multi-Platform Export
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

        {/* Current Platform Info */}
        <div
          style={{
            padding: '12px',
            borderRadius: '10px',
            background: theme.cardBg,
            marginBottom: '16px',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
          }}
        >
          <span style={{ color: theme.textMuted, fontSize: '13px' }}>Source:</span>
          <span style={{ color: theme.text, fontSize: '13px', fontWeight: '600' }}>
            {platformPresets[currentPlatform]?.label || currentPlatform}
          </span>
          <span style={{ color: theme.textMuted, fontSize: '12px' }}>
            ({platformPresets[currentPlatform]?.width} x {platformPresets[currentPlatform]?.height})
          </span>
        </div>

        {/* Quick Select Groups */}
        <div style={{ marginBottom: '16px' }}>
          <div
            style={{
              display: 'flex',
              gap: '8px',
              flexWrap: 'wrap',
            }}
          >
            {Object.entries(PLATFORM_GROUPS).map(([groupId, group]) => (
              <button
                key={groupId}
                onClick={() => selectGroup(groupId)}
                style={{
                  padding: '6px 12px',
                  borderRadius: '16px',
                  border: `1px solid ${theme.cardBorder}`,
                  background: 'transparent',
                  color: theme.text,
                  fontSize: '11px',
                  cursor: 'pointer',
                }}
              >
                {group.label}
              </button>
            ))}
            {selectedPlatforms.length > 0 && (
              <button
                onClick={clearSelection}
                style={{
                  padding: '6px 12px',
                  borderRadius: '16px',
                  border: 'none',
                  background: theme.isDark ? 'rgba(239, 68, 68, 0.2)' : 'rgba(239, 68, 68, 0.1)',
                  color: '#ef4444',
                  fontSize: '11px',
                  cursor: 'pointer',
                }}
              >
                Clear ({selectedPlatforms.length})
              </button>
            )}
          </div>
        </div>

        {/* Tabs */}
        <div
          style={{
            display: 'flex',
            gap: '8px',
            marginBottom: '12px',
            borderBottom: `1px solid ${theme.cardBorder}`,
            paddingBottom: '12px',
          }}
        >
          <button
            onClick={() => setActiveTab('recommended')}
            style={{
              padding: '8px 16px',
              borderRadius: '8px',
              border: 'none',
              background: activeTab === 'recommended' ? theme.accent : 'transparent',
              color: activeTab === 'recommended' ? '#fff' : theme.textMuted,
              fontSize: '13px',
              fontWeight: '500',
              cursor: 'pointer',
            }}
          >
            Recommended
          </button>
          <button
            onClick={() => setActiveTab('all')}
            style={{
              padding: '8px 16px',
              borderRadius: '8px',
              border: 'none',
              background: activeTab === 'all' ? theme.accent : 'transparent',
              color: activeTab === 'all' ? '#fff' : theme.textMuted,
              fontSize: '13px',
              fontWeight: '500',
              cursor: 'pointer',
            }}
          >
            All Platforms
          </button>
        </div>

        {/* Platform List */}
        <div
          style={{
            flex: 1,
            overflowY: 'auto',
            marginBottom: '16px',
          }}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {(activeTab === 'recommended'
              ? recommendations.filter((r) => r.isRecommended).slice(0, 6)
              : allPlatforms
            ).map((platform) => {
              const preset = platform.preset || platformPresets[platform.id]
              const isSelected = selectedPlatforms.includes(platform.id)
              const complexity =
                platform.complexity ||
                checkAdaptationComplexity(layers, currentPlatform, platform.id)

              return (
                <button
                  key={platform.id}
                  onClick={() => togglePlatform(platform.id)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '12px',
                    borderRadius: '10px',
                    border: isSelected
                      ? `2px solid ${theme.accent}`
                      : `1px solid ${theme.cardBorder}`,
                    background: isSelected
                      ? theme.isDark
                        ? 'rgba(99, 102, 241, 0.1)'
                        : 'rgba(99, 102, 241, 0.05)'
                      : 'transparent',
                    cursor: 'pointer',
                    textAlign: 'left',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
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
                      }}
                    >
                      {isSelected && StudioIcons.check('#fff', 14)}
                    </div>

                    {/* Platform Info */}
                    <div>
                      <div style={{ color: theme.text, fontSize: '14px', fontWeight: '500' }}>
                        {preset?.label || platform.id}
                      </div>
                      <div style={{ color: theme.textMuted, fontSize: '11px' }}>
                        {preset?.width} x {preset?.height} • {preset?.aspectRatio}
                      </div>
                    </div>
                  </div>

                  {/* Complexity Indicator */}
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                    }}
                  >
                    <span
                      style={{
                        width: '8px',
                        height: '8px',
                        borderRadius: '50%',
                        background: getComplexityColor(complexity),
                      }}
                    />
                    <span style={{ color: theme.textMuted, fontSize: '11px' }}>
                      {getComplexityLabel(complexity)}
                    </span>
                  </div>
                </button>
              )
            })}
          </div>
        </div>

        {/* Export Button */}
        <button
          onClick={handleExport}
          disabled={selectedPlatforms.length === 0 || isExporting}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '10px',
            padding: '16px',
            borderRadius: '12px',
            border: 'none',
            background:
              selectedPlatforms.length === 0
                ? theme.cardBg
                : `linear-gradient(135deg, ${theme.gradientStart}, ${theme.gradientEnd})`,
            color: selectedPlatforms.length === 0 ? theme.textMuted : '#fff',
            fontSize: '15px',
            fontWeight: '600',
            cursor: selectedPlatforms.length === 0 ? 'not-allowed' : 'pointer',
            opacity: isExporting ? 0.7 : 1,
          }}
        >
          {isExporting ? (
            <>
              <span>Exporting... {Math.round(exportProgress)}%</span>
            </>
          ) : (
            <>
              {StudioIcons.download('#fff', 18)}
              Export {selectedPlatforms.length} Platform{selectedPlatforms.length !== 1 ? 's' : ''}
            </>
          )}
        </button>

        {/* Progress Bar */}
        {isExporting && (
          <div
            style={{
              height: '4px',
              borderRadius: '2px',
              background: theme.cardBg,
              marginTop: '12px',
              overflow: 'hidden',
            }}
          >
            <div
              style={{
                height: '100%',
                borderRadius: '2px',
                background: theme.accent,
                width: `${exportProgress}%`,
                transition: 'width 0.3s ease',
              }}
            />
          </div>
        )}
      </div>
    </>
  )
}

export default MultiPlatformExportModal
