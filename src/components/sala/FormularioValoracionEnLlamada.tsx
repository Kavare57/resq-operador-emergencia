import { useState } from 'react'
import { valoracionService } from '../../services/api'
import { Emergencia } from '../../types'

interface FormularioValoracionEnLlamadaProps {
  solicitudId: number
  solicitanteNombre: string
  solicitanteId: number
  onValoracion: (data: Emergencia) => Promise<void>
  onCancel: () => void
}

export default function FormularioValoracionEnLlamada({
  solicitudId,
  solicitanteNombre,
  solicitanteId,
  onValoracion,
  onCancel,
}: FormularioValoracionEnLlamadaProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [formData, setFormData] = useState({
    tipoAmbulancia: 'BASICA' as 'BASICA' | 'MEDICALIZADA',
    nivelPrioridad: 'MEDIA' as 'BAJA' | 'MEDIA' | 'ALTA',
    descripcion: '',
  })

  const tiposAmbulancia: Array<'BASICA' | 'MEDICALIZADA'> = ['BASICA', 'MEDICALIZADA']

  const prioridades: Array<'BAJA' | 'MEDIA' | 'ALTA'> = ['BAJA', 'MEDIA', 'ALTA']

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      // Validar que la descripción no esté vacía
      if (!formData.descripcion.trim()) {
        setError('Por favor describe la emergencia')
        setLoading(false)
        return
      }

      // Obtener id_operador desde localStorage (por defecto 1 si no existe)
      const idOperador = Number(localStorage.getItem('id_operador')) || 1
      
      // Validar que todos los IDs sean válidos (> 0)
      if (solicitudId <= 0) {
        setError('ID de solicitud inválido')
        setLoading(false)
        return
      }
      if (solicitanteId <= 0) {
        setError('ID de solicitante inválido')
        setLoading(false)
        return
      }

      // Llamar al servicio de valoración
      const response = await valoracionService.valorarEmergencia({
        solicitud_id: solicitudId,
        tipoAmbulancia: formData.tipoAmbulancia,
        nivelPrioridad: formData.nivelPrioridad,
        descripcion: formData.descripcion,
        id_operador: idOperador,
        solicitante_id: solicitanteId,
      })

      // Llamar al callback con los datos de la emergencia creada
      const emergencia = (response.data as any).emergencia || response.data
      await onValoracion(emergencia)
    } catch (err: any) {
      console.error('Error al valorar emergencia:', err)
      setError(err.response?.data?.detail || 'Error al valorar la emergencia. Intenta nuevamente.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <p className="text-sm text-gray-600 mb-2">
          <span className="font-semibold">Solicitante:</span> {solicitanteNombre}
        </p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3">
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      {/* Tipo de Ambulancia */}
      <div>
        <label className="block text-sm font-medium text-gray-900 mb-1">
          Tipo de Ambulancia
        </label>
        <select
          name="tipoAmbulancia"
          value={formData.tipoAmbulancia}
          onChange={handleChange}
          disabled={loading}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
        >
          {tiposAmbulancia.map((tipo) => (
            <option key={tipo} value={tipo}>
              {tipo === 'BASICA' ? 'Ambulancia Básica' : 'Ambulancia Medicalizada'}
            </option>
          ))}
        </select>
      </div>

      {/* Prioridad */}
      <div>
        <label className="block text-sm font-medium text-gray-900 mb-1">
          Nivel de Prioridad
        </label>
        <div className="flex gap-2">
          {prioridades.map((p) => (
            <label key={p} className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="nivelPrioridad"
                value={p}
                checked={formData.nivelPrioridad === p}
                onChange={handleChange}
                disabled={loading}
                className="cursor-pointer disabled:cursor-not-allowed"
              />
              <span
                className={`text-sm font-medium ${
                  p === 'BAJA'
                    ? 'text-green-600'
                    : p === 'MEDIA'
                      ? 'text-yellow-600'
                      : 'text-red-600'
                }`}
              >
                {p === 'BAJA' ? 'Baja' : p === 'MEDIA' ? 'Media' : 'Alta'}
              </span>
            </label>
          ))}
        </div>
      </div>

      {/* Descripción */}
      <div>
        <label className="block text-sm font-medium text-gray-900 mb-1">
          Descripción de la Emergencia *
        </label>
        <textarea
          name="descripcion"
          value={formData.descripcion}
          onChange={handleChange}
          disabled={loading}
          placeholder="Describe qué pasó, síntomas del paciente, medicamentos alérgicos, etc."
          rows={4}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 disabled:bg-gray-100 disabled:cursor-not-allowed resize-none"
          required
        />
        <p className="text-xs text-gray-500 mt-1">
          {formData.descripcion.length} / 500 caracteres
        </p>
      </div>

      {/* Botones */}
      <div className="flex gap-3 pt-4">
        <button
          type="button"
          onClick={onCancel}
          disabled={loading}
          className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          Cancelar
        </button>
        <button
          type="submit"
          disabled={loading}
          className="flex-1 px-4 py-2 bg-red-600 text-white font-medium rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
              Guardando...
            </>
          ) : (
            <>
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
              Confirmar Valoración
            </>
          )}
        </button>
      </div>
    </form>
  )
}
