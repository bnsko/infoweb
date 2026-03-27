'use client'

import { useState, useEffect, useCallback, useRef } from 'react'

export interface WidgetState<T> {
  data: T | null
  loading: boolean
  error: string | null
  lastUpdated: Date | null
  refetch: () => void
}

export function useWidget<T>(url: string, refreshMs = 5 * 60 * 1000): WidgetState<T> {
  const [data, setData] = useState<T | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)
  const mountedRef = useRef(true)

  const fetchData = useCallback(async () => {
    try {
      const res = await fetch(url)
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const json: T = await res.json()
      if (mountedRef.current) {
        setData(json)
        setError(null)
        setLastUpdated(new Date())
      }
    } catch (err) {
      if (mountedRef.current) {
        setError(err instanceof Error ? err.message : 'Chyba načítania')
      }
    } finally {
      if (mountedRef.current) setLoading(false)
    }
  }, [url])

  useEffect(() => {
    mountedRef.current = true
    fetchData()
    const interval = setInterval(fetchData, refreshMs)
    return () => {
      mountedRef.current = false
      clearInterval(interval)
    }
  }, [fetchData, refreshMs])

  return { data, loading, error, lastUpdated, refetch: fetchData }
}
