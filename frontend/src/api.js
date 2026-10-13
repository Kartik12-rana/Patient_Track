const API = '/api'

async function request(path, options = {}) {
  const response = await fetch(`${API}${path}`, {
    headers: { 'Content-Type': 'application/json', ...(options.headers || {}) },
    ...options,
  })
  const body = await response.json().catch(() => ({}))
  if (!response.ok) throw new Error(body.message || 'Request failed')
  return body.data ?? body
}

export const api = {
  dashboard: () => request('/dashboard'),
  bookings: () => request('/bookings'),
  createBooking: (payload) => request('/bookings', { method: 'POST', body: JSON.stringify(payload) }),
  booking: (id) => request(`/bookings/${id}`),
  updateStatus: (id, status) => request(`/bookings/${id}/status`, { method: 'PATCH', body: JSON.stringify({ status }) }),
  drivers: () => request('/drivers'),
  vehicles: () => request('/vehicles'),
  partners: () => request('/partners'),
  tracking: (id) => request(`/tracking/${id}`),
  reset: () => request('/demo/reset', { method: 'POST' }),
}
