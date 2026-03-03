import React, { useCallback, useEffect, useState } from 'react'
import {
  CBadge,
  CButton,
  CCard,
  CCardBody,
  CCardHeader,
  CCol,
  CFormSelect,
  CModal,
  CModalBody,
  CModalHeader,
  CModalTitle,
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
import { getRequests } from 'src/api/requestApi'

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

const RequestList = () => {
  const [requests, setRequests] = useState([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [typeFilter, setTypeFilter] = useState('all')
  const [selectedRequest, setSelectedRequest] = useState(null)

  const fetchRequests = useCallback(async () => {
    setLoading(true)
    try {
      const data = await getRequests({
        page,
        limit: 20,
        type: typeFilter,
      })
      setRequests(Array.isArray(data?.items) ? data.items : [])
      setTotalPages(Number(data?.totalPages) > 0 ? Number(data.totalPages) : 1)
    } catch (error) {
      console.error(error)
      toast.error('Не удалось загрузить заявки')
    } finally {
      setLoading(false)
    }
  }, [page, typeFilter])

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

  const meta = selectedRequest?.meta && typeof selectedRequest.meta === 'object'
    ? selectedRequest.meta
    : {}

  return (
    <>
      <CRow>
        <CCol xs={12}>
          <CCard className="mb-4">
            <CCardHeader className="d-flex justify-content-between align-items-center gap-2">
              <strong>Заявки</strong>
              <div className="d-flex align-items-center gap-2">
                <CFormSelect
                  value={typeFilter}
                  onChange={(event) => {
                    setPage(1)
                    setTypeFilter(event.target.value)
                  }}
                  options={[
                    { label: 'Все типы', value: 'all' },
                    { label: TYPE_LABELS.order, value: 'order' },
                    { label: TYPE_LABELS.consultation, value: 'consultation' },
                    { label: TYPE_LABELS.service, value: 'service' },
                  ]}
                />
                <CButton color="secondary" variant="outline" onClick={fetchRequests}>
                  Обновить
                </CButton>
              </div>
            </CCardHeader>
            <CCardBody>
              {loading ? (
                <CSpinner color="primary" />
              ) : (
                <>
                  <CTable striped hover responsive>
                    <CTableHead>
                      <CTableRow>
                        <CTableHeaderCell scope="col">Дата</CTableHeaderCell>
                        <CTableHeaderCell scope="col">Тип</CTableHeaderCell>
                        <CTableHeaderCell scope="col">Клиент</CTableHeaderCell>
                        <CTableHeaderCell scope="col">Телефон</CTableHeaderCell>
                        <CTableHeaderCell scope="col">Кратко</CTableHeaderCell>
                        <CTableHeaderCell scope="col" className="text-end">
                          Действия
                        </CTableHeaderCell>
                      </CTableRow>
                    </CTableHead>
                    <CTableBody>
                      {requests.map((request) => (
                        <CTableRow key={request.id}>
                          <CTableDataCell>{formatDate(request.createdAt)}</CTableDataCell>
                          <CTableDataCell>
                            <CBadge color={TYPE_COLORS[request.type] || 'secondary'}>
                              {TYPE_LABELS[request.type] || request.type}
                            </CBadge>
                          </CTableDataCell>
                          <CTableDataCell>{request.name || '—'}</CTableDataCell>
                          <CTableDataCell>{request.phone || '—'}</CTableDataCell>
                          <CTableDataCell>{buildSummary(request)}</CTableDataCell>
                          <CTableDataCell className="text-end">
                            <CButton
                              size="sm"
                              color="info"
                              variant="outline"
                              onClick={() => setSelectedRequest(request)}
                            >
                              Подробнее
                            </CButton>
                          </CTableDataCell>
                        </CTableRow>
                      ))}
                      {requests.length === 0 && (
                        <CTableRow>
                          <CTableDataCell colSpan={6} className="text-center text-medium-emphasis">
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
                        onClick={() => setPage((prev) => Math.max(1, prev - 1))}
                      >
                        Назад
                      </CButton>
                      <CButton
                        size="sm"
                        color="secondary"
                        disabled={page >= totalPages}
                        onClick={() => setPage((prev) => prev + 1)}
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
            <div className="d-flex flex-column gap-2">
              <p className="mb-0"><strong>Тип:</strong> {TYPE_LABELS[selectedRequest.type] || selectedRequest.type}</p>
              <p className="mb-0"><strong>Создано:</strong> {formatDate(selectedRequest.createdAt)}</p>
              <p className="mb-0"><strong>Язык:</strong> {selectedRequest.locale || '—'}</p>
              <p className="mb-0"><strong>Имя:</strong> {selectedRequest.name || '—'}</p>
              <p className="mb-0"><strong>Телефон:</strong> {selectedRequest.phone || '—'}</p>
              <p className="mb-0"><strong>Email:</strong> {selectedRequest.email || '—'}</p>
              <p className="mb-0"><strong>Адрес:</strong> {selectedRequest.address || '—'}</p>
              <p className="mb-0"><strong>Регион:</strong> {selectedRequest.region || '—'}</p>
              <p className="mb-0"><strong>Пригород:</strong> {selectedRequest.suburb || '—'}</p>
              <p className="mb-0"><strong>Компания:</strong> {selectedRequest.companyName || '—'}</p>
              <p className="mb-0"><strong>Услуга:</strong> {selectedRequest.serviceName || '—'}</p>
              <p className="mb-0"><strong>Зона доставки:</strong> {selectedRequest.deliveryZone || '—'}</p>
              <p className="mb-0"><strong>Комментарий:</strong> {selectedRequest.comment || '—'}</p>
              <p className="mb-0"><strong>Сумма товаров:</strong> {formatMoney(selectedRequest.itemsAmount)}</p>
              <p className="mb-0"><strong>Доставка:</strong> {formatMoney(selectedRequest.deliveryPrice)}</p>
              <p className="mb-0"><strong>Итого:</strong> {formatMoney(selectedRequest.totalAmount)}</p>

              {Array.isArray(selectedRequest.products) && selectedRequest.products.length > 0 && (
                <div className="mt-2">
                  <strong>Товары:</strong>
                  <ul className="mt-2 mb-0">
                    {selectedRequest.products.map((product, index) => (
                      <li key={`${selectedRequest.id}-${index}`}>
                        {product.name} — {product.qty} x {formatMoney(product.price)} = {formatMoney(product.totalPrice)}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <hr />
              <p className="mb-0"><strong>IP:</strong> {renderMetaValue(meta.ip)}</p>
              <p className="mb-0"><strong>Path:</strong> {renderMetaValue(meta.path)}</p>
              <p className="mb-0"><strong>Method:</strong> {renderMetaValue(meta.method)}</p>
              <p className="mb-0"><strong>Origin:</strong> {renderMetaValue(meta.origin)}</p>
              <p className="mb-0"><strong>Referer:</strong> {renderMetaValue(meta.referer)}</p>
              <p className="mb-0"><strong>User-Agent:</strong> {renderMetaValue(meta.userAgent)}</p>
            </div>
          )}
        </CModalBody>
      </CModal>
    </>
  )
}

export default RequestList
