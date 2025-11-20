import { useState, useCallback } from 'react'
import { apiClient } from '../services/api'
import { ApiResponse } from '../types'

interface UseApiState<T> {
  data: T | null
  loading: boolean
  error: string | null
}

export const useApi = <T,>(url: string) => {
  const [state, setState] = useState<UseApiState<T>>({
    data: null,
    loading: true,
    error: null,
  })

  const fetchData = useCallback(async () => {
    setState({ data: null, loading: true, error: null })
    const response: ApiResponse<T> = await apiClient.get(url)
    
    if (response.success && response.data) {
      setState({ data: response.data, loading: false, error: null })
    } else {
      setState({ data: null, loading: false, error: response.error || 'Error fetching data' })
    }
  }, [url])

  return { ...state, fetchData }
}

export const useMutation = <T,>() => {
  const [state, setState] = useState<UseApiState<T>>({
    data: null,
    loading: false,
    error: null,
  })

  const mutate = useCallback(
    async (
      method: 'post' | 'put' | 'patch' | 'delete',
      url: string,
      data?: unknown
    ) => {
      setState({ data: null, loading: true, error: null })
      
      let response: ApiResponse<T>
      
      switch (method) {
        case 'post':
          response = await apiClient.post(url, data)
          break
        case 'put':
          response = await apiClient.put(url, data)
          break
        case 'patch':
          response = await apiClient.patch(url, data)
          break
        case 'delete':
          response = await apiClient.delete(url)
          break
        default:
          response = { success: false, error: 'Invalid method' }
      }
      
      if (response.success && response.data) {
        setState({ data: response.data, loading: false, error: null })
      } else {
        setState({ data: null, loading: false, error: response.error || 'Error' })
      }
      
      return response
    },
    []
  )

  return { ...state, mutate }
}
