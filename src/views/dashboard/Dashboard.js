import React, { useCallback, useEffect, useMemo, useState } from 'react'
import {
  CAlert,
  CBadge,
  CButton,
  CButtonGroup,
  CCard,
  CCardBody,
  CCardHeader,
  CCol,
  CProgress,
  CRow,
  CSpinner,
  CTable,
  CTableBody,
  CTableDataCell,
  CTableHead,
  CTableHeaderCell,
  CTableRow,
} from '@coreui/react'
import { getRequestStats } from 'src/api/requestApi'

const PERIOD_OPTIONS = [
  { value: 1, label: '1 месяц' },
  { value: 3, label: '3 месяца' },
  { value: 6, label: '6 месяцев' },
  { value: 12, label: '12 месяцев' },
]

const TYPE_LABELS = {
  order: 'Заказы',
  consultation: 'Консультации',
  service: 'Услуги',
}

const TYPE_COLORS = {
  order: 'primary',
  consultation: 'warning',
  service: 'info',
}

const formatDateTime = (value) => {
  if (!value) return '—'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return '—'
  return date.toLocaleString('ru-RU')
}

const formatMoney = (value) => {
  const numeric = Number(value)
  if (!Number.isFinite(numeric)) return '0 лей'
  return `${numeric.toLocaleString('ru-RU', { maximumFractionDigits: 2 })} лей`
}

const MetricCard = ({ title, value, hint, color = 'secondary' }) => (
  <CCard className="h-100 border-start border-start-4" style={{ borderLeftColor: `var(--cui-${color})` }}>
    <CCardBody>
      <div className="text-medium-emphasis small">{title}</div>
      <div className="fs-4 fw-semibold">{value}</div>
      <div className="small text-medium-emphasis">{hint}</div>
    </CCardBody>
  </CCard>
)

const buildRecommendations = ({ metrics, byRegion, byType, periodLabel }) => {
  const recommendations = []

  if (metrics.totalOrders === 0) {
    recommendations.push(`За ${periodLabel} нет заказов: проверьте формы, рекламу и каналы трафика.`)
    return recommendations
  }

  if (metrics.processedRate < 60) {
    recommendations.push(
      `Низкая обработка (${metrics.processedRate}%): ускорьте первый контакт и сделайте SLA обработки до 15 минут.`,
    )
  } else {
    recommendations.push(
      `Хорошая обработка (${metrics.processedRate}%): можно масштабировать трафик без потери качества продаж.`,
    )
  }

  const topRegion = byRegion[0]
  if (topRegion) {
    if (topRegion.share >= 40) {
      recommendations.push(
        `${topRegion.region} дает ${topRegion.share}% заказов: запускайте отдельные офферы и бюджет именно под этот регион.`,
      )
    } else {
      recommendations.push(
        `Спрос распределен по регионам равномерно: тестируйте локальные креативы и доставку в топ-3 регионах.`,
      )
    }
  }

  const consultations = byType.find((row) => row.type === 'consultation')
  const consultationsShare = consultations?.share ?? 0
  if (consultationsShare >= 25) {
    recommendations.push(
      `Доля консультаций ${consultationsShare}%: добавьте скрипт перевода консультации в заказ и контроль конверсии менеджера.`,
    )
  }

  if (metrics.avgCheck > 0) {
    recommendations.push(
      `Средний чек ${formatMoney(metrics.avgCheck)}: добавьте апселл в корзине и в звонке (фильтры, сервис, расходники).`,
    )
  }

  return recommendations.slice(0, 5)
}

const Dashboard = () => {
  const [months, setMonths] = useState(3)
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState(null)
  const [error, setError] = useState('')

  const loadStats = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const data = await getRequestStats({ months, limitRegions: 12 })
      setStats(data)
    } catch (loadError) {
      console.error(loadError)
      setError('Не удалось загрузить статистику заявок')
    } finally {
      setLoading(false)
    }
  }, [months])

  useEffect(() => {
    loadStats()
  }, [loadStats])

  const periodLabel = useMemo(() => {
    return PERIOD_OPTIONS.find((option) => option.value === months)?.label || `${months} мес.`
  }, [months])

  const metrics = stats?.metrics || {
    totalRequests: 0,
    totalOrders: 0,
    processedOrders: 0,
    newOrders: 0,
    processedRate: 0,
    totalAmount: 0,
    avgCheck: 0,
  }

  const byRegion = Array.isArray(stats?.byRegion) ? stats.byRegion : []
  const byType = Array.isArray(stats?.byType) ? stats.byType : []

  const recommendations = useMemo(
    () => buildRecommendations({ metrics, byRegion, byType, periodLabel }),
    [metrics, byRegion, byType, periodLabel],
  )

  return (
    <>
      <CCard className="mb-4">
        <CCardHeader className="d-flex flex-wrap justify-content-between align-items-center gap-3">
          <div>
            <strong>Аналитика заявок и заказов</strong>
            <div className="small text-medium-emphasis">
              Период: {stats?.period?.from ? formatDateTime(stats.period.from) : '—'} -{' '}
              {stats?.period?.to ? formatDateTime(stats.period.to) : '—'}
            </div>
          </div>
          <div className="d-flex align-items-center gap-2">
            <CButtonGroup>
              {PERIOD_OPTIONS.map((option) => (
                <CButton
                  key={option.value}
                  color="secondary"
                  variant={months === option.value ? undefined : 'outline'}
                  onClick={() => setMonths(option.value)}
                >
                  {option.label}
                </CButton>
              ))}
            </CButtonGroup>
            <CButton color="secondary" variant="outline" onClick={loadStats}>
              Обновить
            </CButton>
          </div>
        </CCardHeader>
        <CCardBody>
          {error && (
            <CAlert color="danger" className="mb-3">
              {error}
            </CAlert>
          )}

          {loading ? (
            <div className="py-4">
              <CSpinner color="primary" />
            </div>
          ) : (
            <>
              <CRow className="g-3 mb-3">
                <CCol xs={12} sm={6} lg={3}>
                  <MetricCard
                    title="Всего заявок"
                    value={metrics.totalRequests.toLocaleString('ru-RU')}
                    hint={`за ${periodLabel}`}
                    color="info"
                  />
                </CCol>
                <CCol xs={12} sm={6} lg={3}>
                  <MetricCard
                    title="Заказы"
                    value={metrics.totalOrders.toLocaleString('ru-RU')}
                    hint="тип order"
                    color="primary"
                  />
                </CCol>
                <CCol xs={12} sm={6} lg={3}>
                  <MetricCard
                    title="Обработано"
                    value={metrics.processedOrders.toLocaleString('ru-RU')}
                    hint={`${metrics.processedRate}% от заказов`}
                    color="success"
                  />
                </CCol>
                <CCol xs={12} sm={6} lg={3}>
                  <MetricCard
                    title="Новые (необработ.)"
                    value={metrics.newOrders.toLocaleString('ru-RU')}
                    hint="текущий backlog"
                    color="warning"
                  />
                </CCol>
                <CCol xs={12} sm={6} lg={6}>
                  <MetricCard
                    title="Сумма заказов"
                    value={formatMoney(metrics.totalAmount)}
                    hint={`за ${periodLabel}`}
                    color="danger"
                  />
                </CCol>
                <CCol xs={12} sm={6} lg={6}>
                  <MetricCard
                    title="Средний чек"
                    value={formatMoney(metrics.avgCheck)}
                    hint="среднее по заказам"
                    color="secondary"
                  />
                </CCol>
              </CRow>

              <CRow className="g-3 mb-3">
                <CCol xs={12} lg={6}>
                  <CCard className="h-100">
                    <CCardHeader>Воронка обработки заказов</CCardHeader>
                    <CCardBody>
                      <div className="mb-3">
                        <div className="d-flex justify-content-between small mb-1">
                          <span>Обработано</span>
                          <span>{metrics.processedRate}%</span>
                        </div>
                        <CProgress value={metrics.processedRate} color="success" />
                      </div>
                      <div>
                        <div className="d-flex justify-content-between small mb-1">
                          <span>Не обработано</span>
                          <span>{Math.max(0, 100 - metrics.processedRate).toFixed(2)}%</span>
                        </div>
                        <CProgress value={Math.max(0, 100 - metrics.processedRate)} color="warning" />
                      </div>
                    </CCardBody>
                  </CCard>
                </CCol>

                <CCol xs={12} lg={6}>
                  <CCard className="h-100">
                    <CCardHeader>Структура входящих заявок</CCardHeader>
                    <CCardBody>
                      {byType.length === 0 ? (
                        <div className="text-medium-emphasis">Нет данных</div>
                      ) : (
                        byType.map((item) => (
                          <div key={item.type} className="mb-3">
                            <div className="d-flex justify-content-between small mb-1">
                              <span>
                                <CBadge color={TYPE_COLORS[item.type] || 'secondary'} className="me-2">
                                  {TYPE_LABELS[item.type] || item.type}
                                </CBadge>
                              </span>
                              <span>
                                {item.count} ({item.share}%)
                              </span>
                            </div>
                            <CProgress value={item.share} color={TYPE_COLORS[item.type] || 'secondary'} />
                          </div>
                        ))
                      )}
                    </CCardBody>
                  </CCard>
                </CCol>
              </CRow>

              <CCard className="mb-3">
                <CCardHeader>Регионы: откуда приходят заказы</CCardHeader>
                <CCardBody>
                  <CTable hover responsive>
                    <CTableHead>
                      <CTableRow>
                        <CTableHeaderCell>Регион</CTableHeaderCell>
                        <CTableHeaderCell className="text-end">Заказов</CTableHeaderCell>
                        <CTableHeaderCell className="text-end">Доля</CTableHeaderCell>
                        <CTableHeaderCell className="text-end">Обработано</CTableHeaderCell>
                        <CTableHeaderCell className="text-end">Сумма</CTableHeaderCell>
                        <CTableHeaderCell className="text-end">Средний чек</CTableHeaderCell>
                      </CTableRow>
                    </CTableHead>
                    <CTableBody>
                      {byRegion.map((region) => (
                        <CTableRow key={region.region}>
                          <CTableDataCell>{region.region}</CTableDataCell>
                          <CTableDataCell className="text-end">{region.orders}</CTableDataCell>
                          <CTableDataCell className="text-end">{region.share}%</CTableDataCell>
                          <CTableDataCell className="text-end">{region.processedRate}%</CTableDataCell>
                          <CTableDataCell className="text-end">{formatMoney(region.totalAmount)}</CTableDataCell>
                          <CTableDataCell className="text-end">{formatMoney(region.avgCheck)}</CTableDataCell>
                        </CTableRow>
                      ))}
                      {byRegion.length === 0 && (
                        <CTableRow>
                          <CTableDataCell colSpan={6} className="text-center text-medium-emphasis">
                            Нет данных по регионам за выбранный период
                          </CTableDataCell>
                        </CTableRow>
                      )}
                    </CTableBody>
                  </CTable>
                </CCardBody>
              </CCard>

              <CCard>
                <CCardHeader>Что поможет росту бизнеса</CCardHeader>
                <CCardBody>
                  {recommendations.length === 0 ? (
                    <div className="text-medium-emphasis">Недостаточно данных для рекомендаций</div>
                  ) : (
                    <ol className="mb-0 ps-3">
                      {recommendations.map((text, index) => (
                        <li key={`${index}-${text}`} className="mb-2">
                          {text}
                        </li>
                      ))}
                    </ol>
                  )}
                </CCardBody>
              </CCard>
            </>
          )}
        </CCardBody>
      </CCard>
    </>
  )
}

export default Dashboard
