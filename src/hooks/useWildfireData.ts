import { useMemo } from 'react'
import { mockWildfires, parseWildfireCsv, WildfireRecord } from '@/data/wildfires'

interface UseWildfireDataOptions {
  csvText?: string
}

interface UseWildfireDataResult {
  records: WildfireRecord[]
  errors: string[]
}

export function useWildfireData(options: UseWildfireDataOptions = {}): UseWildfireDataResult {
  const { csvText } = options

  return useMemo(() => {
    if (csvText && csvText.trim().length > 0) {
      return parseWildfireCsv(csvText)
    }

    return { records: mockWildfires, errors: [] }
  }, [csvText])
}
