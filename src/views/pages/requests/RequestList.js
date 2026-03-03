import React, { useCallback, useEffect, useMemo, useState } from 'react'
import CIcon from '@coreui/icons-react'
import { cilCheckCircle, cilLoopCircular, cilTrash } from '@coreui/icons'
import {
  CBadge,
  CButton,
  CCard,
  CCardBody,
  CCardHeader,
  CCol,
  CFormInput,
  CFormSelect,
  CModal,
  CModalBody,
  CModalHeader,
  CModalTitle,
  CNav,
  CNavItem,
  CNavLink,
  CRow,
  CSpinner,
  CTable,
  CTableBody,
  CTableDataCell,
  CTableHead,
  CTableHeaderCell,
  CTableRow,
} from '@coreui/react'
import { toast } from 'react-toastify'
import { deleteRequest, getRequests, updateRequestStatus } from 'src/api/requestApi'

const TYPE_LABELS = {
  order: 'Заказ товара',
  consultation: 'Консультация',
  service: 'Услуга',
}

const TYPE_COLORS = {
  order: 'primary',
  consultation: 'warning',
  service: 'info',
}

const STATUS_LABELS = {
  new: 'Новая',
  processed: 'Обработана',
}

const STATUS_COLORS = {
  new: 'secondary',
  processed: 'success',
}

const STATUS_TABS = [
  { value: 'new', label: 'Новые' },
  { value: 'processed', label: 'Обработанные' },
]

const DATE_SORT_OPTIONS = [
  { value: 'desc', label: 'Сначала новые' },
  { value: 'asc', label: 'Сначала старые' },
]

const DEFAULT_TAB_STATE = {
  page: 1,
  typeFilter: 'all',
  searchQuery: '',
  dateSort: 'desc',
}

const LOCALE_COLORS = {
  ru: {
    label: 'RU',
    background: '#edf4ff',
    border: '#b8d4ff',
  },
  ro: {
    label: 'RO',
    background: '#edfff3',
    border: '#b5f0ca',
  },
}

const formatDate = (value) => {
  if (!value) return '—'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return '—'
  return date.toLocaleString('ru-RU')
}

const formatMoney = (value) => {
  if (value === null || value === undefined || value === '') return '—'
  const numeric = Number(value)
  if (!Number.isFinite(numeric)) return '—'
  return `${numeric.toLocaleString('ru-RU', { maximumFractionDigits: 2 })} лей`
}

const renderMetaValue = (value) => {
  if (value === null || value === undefined || value === '') return '—'
  return String(value)
}

const resolveLocation = (meta) => {
  if (!meta || typeof meta !== 'object') return '—'
  const location = meta.location && typeof meta.location === 'object' ? meta.location : null
  if (!location) return '—'

  const fromLabel = typeof location.label === 'string' ? location.label.trim() : ''
  if (fromLabel) return fromLabel

  const parts = [location.country, location.region, location.city]
    .map((part) => (typeof part === 'string' ? part.trim() : ''))
    .filter(Boolean)

  return parts.length > 0 ? parts.join(', ') : '—'
}

const resolveLocaleStyle = (locale) => {
  const normalizedLocale = typeof locale === 'string' ? locale.toLowerCase().trim() : ''
  return LOCALE_COLORS[normalizedLocale] || null
}

const renderValue = (value) => {
  if (value === null || value === undefined || value === '') return '—'
  return value
}

const DetailItem = ({ label, value }) => (
  <div className="d-flex justify-content-between gap-3 py-1 border-bottom">
    <span className="text-medium-emphasis">{label}</span>
    <span className="text-end">{renderValue(value)}</span>
  </div>
)

const RequestList = () => {
  const [requests, setRequests] = useState([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState('new')
  const [tabState, setTabState] = useState({
    new: { ...DEFAULT_TAB_STATE },
    processed: { ...DEFAULT_TAB_STATE },
  })
  const [tabTotalPages, setTabTotalPages] = useState({
    new: 1,
    processed: 1,
  })
  const [selectedRequest, setSelectedRequest] = useState(null)
  const [statusUpdatingId, setStatusUpdatingId] = useState(null)
  const [deletingId, setDeletingId] = useState(null)

  const activeTabState = tabState[statusFilter] || DEFAULT_TAB_STATE
  const page = activeTabState.page
  const typeFilter = activeTabState.typeFilter
  const searchQuery = activeTabState.searchQuery
  const dateSort = activeTabState.dateSort
  const totalPages = tabTotalPages[statusFilter] || 1

  const updateActiveTabState = useCallback(
    (updater) => {
      setTabState((prev) => {
        const current = prev[statusFilter] || DEFAULT_TAB_STATE
        const patch = typeof updater === 'function' ? updater(current) : updater
        return {
          ...prev,
          [statusFilter]: {
            ...current,
            ...patch,
          },
        }
      })
    },
    [statusFilter],
  )

  const fetchRequests = useCallback(async () => {
    setLoading(true)
    try {
      const data = await getRequests({
        page,
        limit: 20,
        status: statusFilter,
      })
      setRequests(Array.isArray(data?.items) ? data.items : [])
      setTabTotalPages((prev) => ({
        ...prev,
        [statusFilter]: Number(data?.totalPages) > 0 ? Number(data.totalPages) : 1,
      }))
    } catch (error) {
      console.error(error)
      toast.error('Не удалось загрузить заявки')
    } finally {
      setLoading(false)
    }
  }, [page, statusFilter])

  useEffect(() => {
    fetchRequests()
  }, [fetchRequests])

  const buildSummary = (request) => {
    if (request.type === 'order') {
      return `${request.productsCount || 0} поз., сумма: ${formatMoney(request.totalAmount)}`
    }
    if (request.type === 'service') {
      return request.serviceName || '—'
    }
    return 'Запрос звонка'
  }

  const handleToggleStatus = async (request) => {
    const nextStatus = request.status === 'processed' ? 'new' : 'processed'
    setStatusUpdatingId(request.id)

    try {
      const updated = await updateRequestStatus(request.id, nextStatus)
      setRequests((prev) => prev.map((item) => (item.id === request.id ? updated : item)))
      setSelectedRequest((prev) => (prev?.id === request.id ? updated : prev))
      toast.success(nextStatus === 'processed' ? 'Заявка отмечена как обработанная' : 'Заявка возвращена в новые')
      fetchRequests()
    } catch (error) {
      console.error(error)
      toast.error('Не удалось обновить статус')
    } finally {
      setStatusUpdatingId(null)
    }
  }

  const handleDelete = async (request) => {
    const confirmed = window.confirm(`Удалить заявку #${request.id}?`)
    if (!confirmed) return

    setDeletingId(request.id)

    try {
      await deleteRequest(request.id)
      setRequests((prev) => prev.filter((item) => item.id !== request.id))
      setSelectedRequest((prev) => (prev?.id === request.id ? null : prev))
      toast.success('Заявка удалена')
      fetchRequests()
    } catch (error) {
      console.error(error)
      toast.error('Не удалось удалить заявку')
    } finally {
      setDeletingId(null)
    }
  }

  const meta = selectedRequest?.meta && typeof selectedRequest.meta === 'object'
    ? selectedRequest.meta
    : {}

  const availableTypes = useMemo(
    () =>
      Array.from(
        new Set(
          requests
            .filter((request) => request?.status === statusFilter)
            .map((request) => request?.type)
            .filter((type) => Boolean(type) && Boolean(TYPE_LABELS[type])),
        ),
      ),
    [requests, statusFilter],
  )

  const typeOptions = useMemo(
    () => [
      { label: 'Все типы', value: 'all' },
      ...availableTypes.map((type) => ({
        label: TYPE_LABELS[type],
        value: type,
      })),
    ],
    [availableTypes],
  )

  useEffect(() => {
    if (typeFilter !== 'all' && !availableTypes.includes(typeFilter)) {
      updateActiveTabState({ typeFilter: 'all' })
    }
  }, [availableTypes, typeFilter, updateActiveTabState])

  const isRowBusy = (requestId) => statusUpdatingId === requestId || deletingId === requestId
  const normalizedSearch = searchQuery.trim().toLowerCase()
  const visibleRequests = requests
    .filter((request) => request?.status === statusFilter)
    .filter((request) => (typeFilter === 'all' ? true : request?.type === typeFilter))
    .filter((request) => {
      if (!normalizedSearch) return true
      try {
        return JSON.stringify(request).toLowerCase().includes(normalizedSearch)
      } catch {
        return false
      }
    })
    .sort((a, b) => {
      const first = new Date(a?.createdAt || 0).getTime()
      const second = new Date(b?.createdAt || 0).getTime()
      if (dateSort === 'asc') return first - second
      return second - first
    })

  return (
    <>
      <CRow>
        <CCol xs={12}>
          <CCard className="mb-4">
            <CCardHeader className="d-flex justify-content-between align-items-center gap-2">
              <strong>Заявки</strong>
              <CButton color="secondary" variant="outline" onClick={fetchRequests}>
                Обновить
              </CButton>
            </CCardHeader>
            <CCardBody>
              {loading ? (
                <CSpinner color="primary" />
              ) : (
                <>
                  <CNav variant="tabs" className="mb-3">
                    {STATUS_TABS.map((tab) => (
                      <CNavItem key={tab.value}>
                        <CNavLink
                          href="#"
                          active={statusFilter === tab.value}
                          onClick={(event) => {
                            event.preventDefault()
                            if (statusFilter === tab.value) return
                            setStatusFilter(tab.value)
                          }}
                        >
                          {tab.label}
                        </CNavLink>
                      </CNavItem>
                    ))}
                  </CNav>
                  <div className="d-flex align-items-center gap-2 mb-3">
                    <CFormInput
                      placeholder="Поиск по всем полям"
                      value={searchQuery}
                      onChange={(event) => {
                        updateActiveTabState({
                          page: 1,
                          searchQuery: event.target.value,
                        })
                      }}
                    />
                    <CFormSelect
                      value={typeFilter}
                      onChange={(event) => {
                        updateActiveTabState({
                          page: 1,
                          typeFilter: event.target.value,
                        })
                      }}
                      options={typeOptions}
                    />
                    <CFormSelect
                      value={dateSort}
                      onChange={(event) => updateActiveTabState({ dateSort: event.target.value })}
                      options={DATE_SORT_OPTIONS}
                    />
                  </div>
                  <CTable striped hover responsive>
                    <CTableHead>
                      <CTableRow>
                        <CTableHeaderCell scope="col">Дата</CTableHeaderCell>
                        <CTableHeaderCell scope="col">Тип</CTableHeaderCell>
                        <CTableHeaderCell scope="col">Статус</CTableHeaderCell>
                        <CTableHeaderCell scope="col">Клиент</CTableHeaderCell>
                        <CTableHeaderCell scope="col">Телефон</CTableHeaderCell>
                        <CTableHeaderCell scope="col">Кратко</CTableHeaderCell>
                        <CTableHeaderCell scope="col" className="text-end">
                          Действия
                        </CTableHeaderCell>
                      </CTableRow>
                    </CTableHead>
                    <CTableBody>
                      {visibleRequests.map((request) => {
                        const localeStyle = resolveLocaleStyle(request.locale)
                        return (
                          <CTableRow
                            key={request.id}
                            onClick={() => setSelectedRequest(request)}
                            style={
                              localeStyle
                                ? {
                                    backgroundColor: localeStyle.background,
                                    cursor: 'pointer',
                                  }
                                : { cursor: 'pointer' }
                            }
                          >
                          <CTableDataCell>{formatDate(request.createdAt)}</CTableDataCell>
                          <CTableDataCell>
                            <CBadge color={TYPE_COLORS[request.type] || 'secondary'}>
                              {TYPE_LABELS[request.type] || request.type}
                            </CBadge>
                          </CTableDataCell>
                          <CTableDataCell>
                            <CBadge color={STATUS_COLORS[request.status] || 'secondary'}>
                              {STATUS_LABELS[request.status] || request.status || 'Новая'}
                            </CBadge>
                          </CTableDataCell>
                          <CTableDataCell>{request.name || '—'}</CTableDataCell>
                          <CTableDataCell>{request.phone || '—'}</CTableDataCell>
                          <CTableDataCell>{buildSummary(request)}</CTableDataCell>
                          <CTableDataCell className="text-end">
                            <div className="d-inline-flex gap-2">
                              <CButton
                                size="sm"
                                color="success"
                                variant="outline"
                                disabled={isRowBusy(request.id)}
                                onClick={(event) => {
                                  event.stopPropagation()
                                  handleToggleStatus(request)
                                }}
                                title={request.status === 'processed' ? 'Вернуть в новые' : 'Отметить обработанной'}
                                aria-label={request.status === 'processed' ? 'Вернуть в новые' : 'Отметить обработанной'}
                              >
                                <CIcon icon={request.status === 'processed' ? cilLoopCircular : cilCheckCircle} />
                              </CButton>
                              <CButton
                                size="sm"
                                color="danger"
                                variant="outline"
                                disabled={isRowBusy(request.id)}
                                onClick={(event) => {
                                  event.stopPropagation()
                                  handleDelete(request)
                                }}
                                title="Удалить заявку"
                                aria-label="Удалить заявку"
                              >
                                <CIcon icon={cilTrash} />
                              </CButton>
                            </div>
                          </CTableDataCell>
                          </CTableRow>
                        )
                      })}
                      {visibleRequests.length === 0 && (
                        <CTableRow>
                          <CTableDataCell colSpan={7} className="text-center text-medium-emphasis">
                            Заявок пока нет
                          </CTableDataCell>
                        </CTableRow>
                      )}
                    </CTableBody>
                  </CTable>
                  <div className="d-flex justify-content-between align-items-center mt-3">
                    <span className="small text-medium-emphasis">
                      Страница {page} из {totalPages}
                    </span>
                    <div className="d-flex gap-2">
                      <CButton
                        size="sm"
                        color="secondary"
                        disabled={page <= 1}
                        onClick={() =>
                          updateActiveTabState((prev) => ({
                            page: Math.max(1, prev.page - 1),
                          }))
                        }
                      >
                        Назад
                      </CButton>
                      <CButton
                        size="sm"
                        color="secondary"
                        disabled={page >= totalPages}
                        onClick={() =>
                          updateActiveTabState((prev) => ({
                            page: prev.page + 1,
                          }))
                        }
                      >
                        Вперёд
                      </CButton>
                    </div>
                  </div>
                </>
              )}
            </CCardBody>
          </CCard>
        </CCol>
      </CRow>

      <CModal size="lg" visible={Boolean(selectedRequest)} onClose={() => setSelectedRequest(null)}>
        <CModalHeader>
          <CModalTitle>Заявка #{selectedRequest?.id || '—'}</CModalTitle>
        </CModalHeader>
        <CModalBody>
          {selectedRequest && (
            <div className="d-flex flex-column gap-3">
              <div className="d-flex flex-wrap align-items-center gap-2">
                <CBadge color={TYPE_COLORS[selectedRequest.type] || 'secondary'}>
                  {TYPE_LABELS[selectedRequest.type] || selectedRequest.type}
                </CBadge>
                <CBadge color={STATUS_COLORS[selectedRequest.status] || 'secondary'}>
                  {STATUS_LABELS[selectedRequest.status] || selectedRequest.status || 'Новая'}
                </CBadge>
                <CBadge color="light">Язык: {(selectedRequest.locale || '—').toUpperCase()}</CBadge>
                <span className="small text-medium-emphasis">Создано: {formatDate(selectedRequest.createdAt)}</span>
              </div>

              <CRow className="g-3">
                <CCol xs={12} md={6}>
                  <CCard className="h-100 border-0 bg-light">
                    <CCardBody>
                      <h6 className="mb-3">Клиент</h6>
                      <DetailItem label="Имя" value={selectedRequest.name} />
                      <DetailItem label="Телефон" value={selectedRequest.phone} />
                      <DetailItem label="Email" value={selectedRequest.email} />
                      <DetailItem label="Компания" value={selectedRequest.companyName} />
                      <DetailItem label="Регион" value={selectedRequest.region} />
                      <DetailItem label="Пригород" value={selectedRequest.suburb} />
                      <DetailItem label="Адрес" value={selectedRequest.address} />
                      <DetailItem label="Зона доставки" value={selectedRequest.deliveryZone} />
                      <DetailItem label="Комментарий" value={selectedRequest.comment} />
                    </CCardBody>
                  </CCard>
                </CCol>

                <CCol xs={12} md={6}>
                  <CCard className="h-100 border-0 bg-light">
                    <CCardBody>
                      <h6 className="mb-3">Заявка</h6>
                      <DetailItem label="ID" value={selectedRequest.id} />
                      <DetailItem label="Услуга" value={selectedRequest.serviceName} />
                      <DetailItem label="Кол-во товаров" value={selectedRequest.productsCount ?? 0} />
                      <DetailItem label="Сумма товаров" value={formatMoney(selectedRequest.itemsAmount)} />
                      <DetailItem label="Доставка" value={formatMoney(selectedRequest.deliveryPrice)} />
                      <DetailItem label="Итого" value={formatMoney(selectedRequest.totalAmount)} />
                    </CCardBody>
                  </CCard>
                </CCol>
              </CRow>

              {Array.isArray(selectedRequest.products) && selectedRequest.products.length > 0 && (
                <CCard className="border-0 bg-light">
                  <CCardBody>
                    <h6 className="mb-3">Товары</h6>
                    <CTable responsive small align="middle" className="mb-0">
                      <CTableHead>
                        <CTableRow>
                          <CTableHeaderCell>Товар</CTableHeaderCell>
                          <CTableHeaderCell className="text-center">Кол-во</CTableHeaderCell>
                          <CTableHeaderCell className="text-end">Цена</CTableHeaderCell>
                          <CTableHeaderCell className="text-end">Сумма</CTableHeaderCell>
                          <CTableHeaderCell className="text-end">Ссылка</CTableHeaderCell>
                        </CTableRow>
                      </CTableHead>
                      <CTableBody>
                        {selectedRequest.products.map((product, index) => (
                          <CTableRow key={`${selectedRequest.id}-${index}`}>
                            <CTableDataCell>{product.name}</CTableDataCell>
                            <CTableDataCell className="text-center">{product.qty}</CTableDataCell>
                            <CTableDataCell className="text-end">{formatMoney(product.price)}</CTableDataCell>
                            <CTableDataCell className="text-end">{formatMoney(product.totalPrice)}</CTableDataCell>
                            <CTableDataCell className="text-end">
                              {product.productUrl ? (
                                <a href={product.productUrl} target="_blank" rel="noreferrer">
                                  Открыть
                                </a>
                              ) : (
                                '—'
                              )}
                            </CTableDataCell>
                          </CTableRow>
                        ))}
                      </CTableBody>
                    </CTable>
                  </CCardBody>
                </CCard>
              )}

              <CCard className="border-0 bg-light">
                <CCardBody>
                  <h6 className="mb-3">Источник</h6>
                  <DetailItem label="IP" value={renderMetaValue(meta.ip)} />
                  <DetailItem label="Локация" value={resolveLocation(meta)} />
                </CCardBody>
              </CCard>
            </div>
          )}
        </CModalBody>
      </CModal>
    </>
  )
}

export default RequestList
