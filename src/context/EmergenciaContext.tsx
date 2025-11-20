import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react'
import { Emergencia } from '../types'

interface EmergenciaContextType {
  emergencias: Emergencia[]
  selectedEmergencia: Emergencia | null
  addEmergencia: (emergencia: Emergencia) => void
  removeEmergencia: (id: string) => void
  selectEmergencia: (emergencia: Emergencia | null) => void
  updateEmergencia: (id: string, emergencia: Partial<Emergencia>) => void
  clearEmergencias: () => void
}

const EmergenciaContext = createContext<EmergenciaContextType | undefined>(undefined)

export function EmergenciaProvider({ children }: { children: ReactNode }) {
  const [emergencias, setEmergencias] = useState<Emergencia[]>([])
  const [selectedEmergencia, setSelectedEmergencia] = useState<Emergencia | null>(null)

  const addEmergencia = useCallback((emergencia: Emergencia) => {
    setEmergencias((prev) => {
      // Evitar duplicados
      const exists = prev.some((e) => e.id === emergencia.id)
      if (exists) return prev
      return [emergencia, ...prev]
    })
  }, [])

  const removeEmergencia = useCallback((id: string) => {
    setEmergencias((prev) => prev.filter((e) => e.id !== id))
    if (selectedEmergencia?.id === id) {
      setSelectedEmergencia(null)
    }
  }, [selectedEmergencia])

  const selectEmergencia = useCallback((emergencia: Emergencia | null) => {
    setSelectedEmergencia(emergencia)
  }, [])

  const updateEmergencia = useCallback((id: string, updates: Partial<Emergencia>) => {
    setEmergencias((prev) =>
      prev.map((e) => (e.id === id ? { ...e, ...updates } : e))
    )
    if (selectedEmergencia?.id === id) {
      setSelectedEmergencia({ ...selectedEmergencia, ...updates })
    }
  }, [selectedEmergencia])

  const clearEmergencias = useCallback(() => {
    setEmergencias([])
    setSelectedEmergencia(null)
  }, [])

  const value: EmergenciaContextType = {
    emergencias,
    selectedEmergencia,
    addEmergencia,
    removeEmergencia,
    selectEmergencia,
    updateEmergencia,
    clearEmergencias,
  }

  return <EmergenciaContext.Provider value={value}>{children}</EmergenciaContext.Provider>
}

export function useEmergencias() {
  const context = useContext(EmergenciaContext)
  if (context === undefined) {
    throw new Error('useEmergencias debe usarse dentro de EmergenciaProvider')
  }
  return context
}
