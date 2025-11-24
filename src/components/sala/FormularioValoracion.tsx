import { useState } from 'react'
import { ValoracionEmergencia } from '../../pages/SalaLiveKitPage'

interface FormularioValoracionProps {
  solicitudId: number
  onValoracion: (data: ValoracionEmergencia) => void
  enviando: boolean
}

export default function FormularioValoracion({
  solicitudId,
  onValoracion,
  enviando,
}: FormularioValoracionProps) {
  const [descripcion, setDescripcion] = useState('')
  const [tipoAmbulancia, setTipoAmbulancia] = useState<'BASICA' | 'MEDICALIZADA'>('BASICA')
  const [nivelPrioridad, setNivelPrioridad] = useState<'BAJA' | 'MEDIA' | 'ALTA'>('MEDIA')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!descripcion.trim()) {
      alert('Por favor, describe la situación de la emergencia')
      return
    }

    onValoracion({
      solicitud_id: solicitudId,
      descripcion: descripcion.trim(),
      tipoAmbulancia,
      nivelPrioridad,
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Descripción */}
      <div>
        <label htmlFor="descripcion" className="block text-sm font-medium text-gray-900 mb-2">
          Descripción de la Situación *
        </label>
        <textarea
          id="descripcion"
          value={descripcion}
          onChange={(e) => setDescripcion(e.target.value)}
          disabled={enviando}
          placeholder="Describe brevemente la situación de emergencia, síntomas, lesiones, etc."
          rows={4}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
        />
      </div>

      {/* Tipo de Ambulancia */}
      <div>
        <label htmlFor="tipoAmbulancia" className="block text-sm font-medium text-gray-900 mb-2">
          Tipo de Ambulancia Requerida *
        </label>
        <select
          id="tipoAmbulancia"
          value={tipoAmbulancia}
          onChange={(e) => setTipoAmbulancia(e.target.value as 'BASICA' | 'MEDICALIZADA')}
          disabled={enviando}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
        >
          <option value="BASICA">Ambulancia Básica (Transporte)</option>
          <option value="MEDICALIZADA">Ambulancia Medicalizada (Soporte Avanzado)</option>
        </select>
        <p className="mt-1 text-xs text-gray-500">
          {tipoAmbulancia === 'BASICA'
            ? 'Transporte básico, ideal para lesiones menores o traslados simples'
            : 'Con personal médico calificado, para situaciones más graves'}
        </p>
      </div>

      {/* Nivel de Prioridad */}
      <div>
        <label htmlFor="nivelPrioridad" className="block text-sm font-medium text-gray-900 mb-2">
          Nivel de Prioridad *
        </label>
        <select
          id="nivelPrioridad"
          value={nivelPrioridad}
          onChange={(e) => setNivelPrioridad(e.target.value as 'BAJA' | 'MEDIA' | 'ALTA')}
          disabled={enviando}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
        >
          <option value="BAJA">Baja - Situación estable</option>
          <option value="MEDIA">Media - Situación moderada</option>
          <option value="ALTA">Alta - Situación crítica o grave</option>
        </select>
      </div>

      {/* Botón Submit */}
      <button
        type="submit"
        disabled={enviando}
        className="w-full px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-2"
      >
        {enviando ? (
          <>
            <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            Procesando valoración...
          </>
        ) : (
          <>
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            Completar Valoración
          </>
        )}
      </button>
    </form>
  )
}
