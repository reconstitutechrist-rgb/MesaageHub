import { useState, useEffect } from 'react'
import { usePhoneTheme } from '@/context/PhoneThemeContext'
import { StudioIcons } from '../utils/StudioIcons'
import { analyticsService } from '@/services/AnalyticsService'

/**
 * AnalyticsPanel - Collapsible performance analytics dashboard
 *
 * Shows campaign metrics from AnalyticsService:
 * - Summary cards (total campaigns, delivery rate, engagement rate)
 * - AI model comparison
 * - Top performing campaigns
 */
export function AnalyticsPanel() {
  const { theme } = usePhoneTheme()
  const [isExpanded, setIsExpanded] = useState(false)
  const [summary, setSummary] = useState(null)
  const [modelPerformance, setModelPerformance] = useState(null)
  const [topCampaigns, setTopCampaigns] = useState(null)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (!isExpanded || summary) return

    const fetchAnalytics = async () => {
      setIsLoading(true)
      try {
        const [summaryRes, modelsRes, topRes] = await Promise.all([
          analyticsService.getDashboardSummary('demo-user'),
          analyticsService.getAIModelPerformance(),
          analyticsService.getTopPerformingCampaigns('demo-user', { limit: 5 }),
        ])

        if (summaryRes.success) setSummary(summaryRes.data)
        if (modelsRes.success) setModelPerformance(modelsRes.data)
        if (topRes.success) setTopCampaigns(topRes.data)
      } catch (error) {
        console.error('Failed to load analytics:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchAnalytics()
  }, [isExpanded, summary])

  return (
    <div>
      {/* Header - toggle expand/collapse */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        style={{
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: 0,
          background: 'none',
          border: 'none',
          cursor: 'pointer',
        }}
      >
        <h3
          style={{
            color: theme.text,
            fontSize: '14px',
            fontWeight: '600',
            margin: 0,
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          {StudioIcons.sliders(theme.accent, 18)} Performance
        </h3>
        <div
          style={{
            transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)',
            transition: 'transform 0.2s ease',
          }}
        >
          {StudioIcons.chevronDown(theme.textMuted, 16)}
        </div>
      </button>

      {/* Expanded content */}
      {isExpanded && (
        <div style={{ marginTop: '12px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {isLoading ? (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                padding: '24px',
                color: theme.textMuted,
                fontSize: '13px',
              }}
            >
              <div
                style={{
                  width: '16px',
                  height: '16px',
                  border: `2px solid ${theme.textMuted}`,
                  borderTopColor: 'transparent',
                  borderRadius: '50%',
                  animation: 'spin 1s linear infinite',
                }}
              />
              Loading analytics...
            </div>
          ) : summary &&
            summary.totalCampaigns === 0 &&
            (!modelPerformance || modelPerformance.length === 0) ? (
            <div
              style={{
                padding: '20px',
                borderRadius: '10px',
                background: theme.cardBg,
                color: theme.textMuted,
                fontSize: '13px',
                textAlign: 'center',
              }}
            >
              No campaign data yet. Send your first campaign to see performance metrics.
            </div>
          ) : (
            <>
              {/* Summary Cards */}
              {summary && (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px' }}>
                  <div
                    style={{
                      padding: '12px 8px',
                      borderRadius: '10px',
                      background: theme.cardBg,
                      border: `1px solid ${theme.cardBorder}`,
                      textAlign: 'center',
                    }}
                  >
                    <div
                      style={{
                        color: theme.accent,
                        fontSize: '20px',
                        fontWeight: '700',
                        lineHeight: 1.2,
                      }}
                    >
                      {summary.totalCampaigns}
                    </div>
                    <div style={{ color: theme.textMuted, fontSize: '10px', marginTop: '4px' }}>
                      Campaigns
                    </div>
                  </div>
                  <div
                    style={{
                      padding: '12px 8px',
                      borderRadius: '10px',
                      background: theme.cardBg,
                      border: `1px solid ${theme.cardBorder}`,
                      textAlign: 'center',
                    }}
                  >
                    <div
                      style={{
                        color: '#22c55e',
                        fontSize: '20px',
                        fontWeight: '700',
                        lineHeight: 1.2,
                      }}
                    >
                      {(summary.avgDeliveryRate * 100).toFixed(1)}%
                    </div>
                    <div style={{ color: theme.textMuted, fontSize: '10px', marginTop: '4px' }}>
                      Delivery
                    </div>
                  </div>
                  <div
                    style={{
                      padding: '12px 8px',
                      borderRadius: '10px',
                      background: theme.cardBg,
                      border: `1px solid ${theme.cardBorder}`,
                      textAlign: 'center',
                    }}
                  >
                    <div
                      style={{
                        color: '#f59e0b',
                        fontSize: '20px',
                        fontWeight: '700',
                        lineHeight: 1.2,
                      }}
                    >
                      {(summary.avgEngagementRate * 100).toFixed(1)}%
                    </div>
                    <div style={{ color: theme.textMuted, fontSize: '10px', marginTop: '4px' }}>
                      Engagement
                    </div>
                  </div>
                </div>
              )}

              {/* AI Model Comparison */}
              {modelPerformance && modelPerformance.length > 0 && (
                <div>
                  <span
                    style={{
                      color: theme.textMuted,
                      fontSize: '11px',
                      fontWeight: '500',
                      marginBottom: '8px',
                      display: 'block',
                    }}
                  >
                    AI Model Comparison
                  </span>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    {modelPerformance.map((model, idx) => (
                      <div
                        key={idx}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          padding: '8px 10px',
                          borderRadius: '8px',
                          background: theme.cardBg,
                          border: `1px solid ${theme.cardBorder}`,
                        }}
                      >
                        <div>
                          <div
                            style={{
                              color: theme.text,
                              fontSize: '12px',
                              fontWeight: '600',
                            }}
                          >
                            {model.ai_model}
                          </div>
                          <div style={{ color: theme.textMuted, fontSize: '10px' }}>
                            {model.total_campaigns} campaigns
                          </div>
                        </div>
                        <div
                          style={{
                            color: theme.accent,
                            fontSize: '13px',
                            fontWeight: '600',
                          }}
                        >
                          {(model.avg_engagement_rate * 100).toFixed(1)}%
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Top Performing Campaigns */}
              {topCampaigns && topCampaigns.length > 0 && (
                <div>
                  <span
                    style={{
                      color: theme.textMuted,
                      fontSize: '11px',
                      fontWeight: '500',
                      marginBottom: '8px',
                      display: 'block',
                    }}
                  >
                    Top Performing
                  </span>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    {topCampaigns.map((campaign, idx) => (
                      <div
                        key={idx}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          padding: '6px 10px',
                          borderRadius: '6px',
                          background: idx === 0 ? `${theme.accent}10` : 'transparent',
                        }}
                      >
                        <span style={{ color: theme.text, fontSize: '12px' }}>
                          {campaign.name || `Campaign ${idx + 1}`}
                        </span>
                        <span
                          style={{
                            color: '#22c55e',
                            fontSize: '12px',
                            fontWeight: '600',
                          }}
                        >
                          {((campaign.engagement_rate || 0) * 100).toFixed(1)}%
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  )
}

export default AnalyticsPanel
