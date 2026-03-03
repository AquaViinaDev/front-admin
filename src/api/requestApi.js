import { API_BASE_URL } from 'src/config/api'

export const getRequests = async ({ page = 1, limit = 20, type = 'all', status = 'all' } = {}) => {
  const url = new URL(`${API_BASE_URL}/requests`)
  url.searchParams.set('page', String(page))
  url.searchParams.set('limit', String(limit))
  if (type && type !== 'all') {
    url.searchParams.set('type', type)
  }
  if (status && status !== 'all') {
    url.searchParams.set('status', status)
  }

  const response = await fetch(url.toString())

  if (!response.ok) {
    const body = await response.text()
    throw new Error(`Ошибка при получении заявок: ${response.status} ${body}`)
  }

  return response.json()
}

export const getRequestById = async (id) => {
  const response = await fetch(`${API_BASE_URL}/requests/${id}`)
  if (!response.ok) {
    const body = await response.text()
    throw new Error(`Ошибка при получении заявки: ${response.status} ${body}`)
  }
  return response.json()
}

export const updateRequestStatus = async (id, status) => {
  const response = await fetch(`${API_BASE_URL}/requests/${id}/status`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ status }),
  })

  if (!response.ok) {
    const body = await response.text()
    throw new Error(`Ошибка при обновлении статуса заявки: ${response.status} ${body}`)
  }

  return response.json()
}

export const deleteRequest = async (id) => {
  const response = await fetch(`${API_BASE_URL}/requests/${id}`, {
    method: 'DELETE',
  })

  if (!response.ok) {
    const body = await response.text()
    throw new Error(`Ошибка при удалении заявки: ${response.status} ${body}`)
  }

  return response.json()
}
