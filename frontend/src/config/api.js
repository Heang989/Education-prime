// API Configuration
// Use environment variable if available, otherwise default to localhost
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000'
export const API_URL = `${API_BASE_URL}/api`

// Request timeout in milliseconds
export const REQUEST_TIMEOUT = 10000 // 10 seconds

// Helper function to create fetch with timeout
export const fetchWithTimeout = async (url, options = {}, timeout = REQUEST_TIMEOUT) => {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), timeout)

    try {
        const response = await fetch(url, {
            ...options,
            signal: controller.signal
        })
        clearTimeout(timeoutId)
        return response
    } catch (error) {
        clearTimeout(timeoutId)
        if (error.name === 'AbortError') {
            throw new Error('Request timeout - please check if backend is running')
        }
        if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
            throw new Error(`Cannot connect to backend at ${API_BASE_URL} - please check if backend is running`)
        }
        throw error
    }
}

