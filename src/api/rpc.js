import axiosClient from './axiosClient'

/**
 * Calls a backend RPC through the gateway: POST /api/rpc/{package.Service}/{Method}, body = proto3 JSON.
 * Proto3 JSON omits default values (false, 0, ""), so callers should default missing fields.
 */
export async function rpc(service, method, body = {}, config) {
  const { data } = await axiosClient.post(`/rpc/${service}/${method}`, body, config)
  return data
}

// Gateway error body: { code, message, requestId } (code = gRPC status name)
export function getApiErrorMessage(error, fallback = 'Request failed') {
  const data = error.response?.data
  if (data?.message) return data.message
  if (!error.response) return 'Cannot reach the server'
  return fallback
}
