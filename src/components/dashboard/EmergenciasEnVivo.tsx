import { useState } from 'react'
import { Card, Badge } from '../common'
import { Emergencia } from '../../types'

interface EmergenciasEnVivoProps {
  emergencias: Emergencia[]
  onUnirse: (emergencia: Emergencia) => void
  uniendose?: string | null
}

export default function EmergenciasEnVivo({
  emergencias,
  onUnirse,
  uniendose,
}: EmergenciasEnVivoProps) {
  const [filtroEstado, setFiltroEstado] = useState<string | null>(null)

  const emergenciasFiltraras = filtroEstado
    ? emergencias.filter((e) => e.estado === filtroEstado)
    : emergencias

  const getPriorityColor = (prioridad?: string) => {
    switch (prioridad) {
      case 'ALTA':
        return 'bg-red-100 text-red-800'
      case 'MEDIA':
        return 'bg-yellow-100 text-yellow-800'
      case 'BAJA':
        return 'bg-green-100 text-green-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getEstadoColor = (estado?: string) => {
    switch (estado) {
      case 'pendiente':
        return 'bg-blue-100 text-blue-800'
      case 'asignada':
        return 'bg-purple-100 text-purple-800'
      case 'en_progreso':
        return 'bg-orange-100 text-orange-800'
      case 'resuelta':
        return 'bg-green-100 text-green-800'
      case 'cancelada':
        return 'bg-gray-100 text-gray-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  if (emergencias.length === 0) {
    return (
      <Card className="p-8 text-center">
        <div className="text-5xl mb-4">🚑</div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Sin emergencias activas</h3>
        <p className="text-gray-600">
          No hay emergencias en este momento. Las solicitudes aparecerán aquí en tiempo real.
        </p>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      {/* Filtros */}
      <div className="flex gap-2 flex-wrap">
        <button
          onClick={() => setFiltroEstado(null)}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            filtroEstado === null
              ? 'bg-blue-600 text-white'
              : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
          }`}
        >
          Todas ({emergencias.length})
        </button>
        {['pendiente', 'asignada', 'en_progreso'].map((estado) => {
          const count = emergencias.filter((e) => e.estado === estado).length
          return (
            <button
              key={estado}
              onClick={() => setFiltroEstado(estado)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filtroEstado === estado
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
              }`}
            >
              {estado.replace('_', ' ').toUpperCase()} ({count})
            </button>
          )
        })}
      </div>

      {/* Grid de Emergencias */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {emergenciasFiltraras.map((emergencia) => (
          <Card key={emergencia.id} className="p-4 hover:shadow-lg transition-shadow">
            {/* Header */}
            <div className="flex items-start justify-between mb-3">
              <div>
                <h3 className="font-bold text-lg text-gray-900">
                  Emergencia #{emergencia.id || emergencia.numero_emergencia || '?'}
                </h3>
                <p className="text-xs text-gray-500">
                  {emergencia.fecha_creacion
                    ? new Date(emergencia.fecha_creacion).toLocaleString()
                    : emergencia.fechaHora
                    ? new Date(emergencia.fechaHora).toLocaleString()
                    : 'Sin fecha'}
                </p>
              </div>
            </div>

            {/* Badges */}
            <div className="flex gap-2 mb-3 flex-wrap">
              <Badge
                label={emergencia.prioridad || emergencia.nivelPrioridad || 'Sin prioridad'}
                className={getPriorityColor(emergencia.prioridad || emergencia.nivelPrioridad)}
              />
              <Badge
                label={emergencia.estado?.replace('_', ' ').toUpperCase() || 'Desconocido'}
                className={getEstadoColor(emergencia.estado)}
              />
              {emergencia.tipoAmbulancia && (
                <Badge
                  label={`🚑 ${emergencia.tipoAmbulancia}`}
                  className="bg-blue-100 text-blue-800"
                />
              )}
            </div>

            {/* Solicitante */}
            {emergencia.solicitante && (
              <div className="mb-3 p-3 bg-gray-50 rounded">
                <p className="text-xs text-gray-600 font-semibold mb-1">Solicitante:</p>
                <p className="text-sm text-gray-900">
                  {emergencia.solicitante.nombre} {emergencia.solicitante.apellido}
                </p>
                {emergencia.solicitante.numeroDocumento && (
                  <p className="text-xs text-gray-600">
                    {emergencia.solicitante.tipoDocumento}: {emergencia.solicitante.numeroDocumento}
                  </p>
                )}
              </div>
            )}

            {/* Ubicación */}
            {emergencia.ubicacion && (
              <div className="mb-3 p-3 bg-gray-50 rounded">
                <p className="text-xs text-gray-600 font-semibold mb-1">📍 Ubicación:</p>
                <p className="text-sm text-gray-900">
                  {emergencia.ubicacion.latitud}, {emergencia.ubicacion.longitud}
                </p>
                {emergencia.ubicacion.direccion && (
                  <p className="text-xs text-gray-600">{emergencia.ubicacion.direccion}</p>
                )}
              </div>
            )}

            {/* Descripción */}
            {emergencia.descripcion && (
              <div className="mb-3">
                <p className="text-xs text-gray-600 font-semibold mb-1">Descripción:</p>
                <p className="text-sm text-gray-700 line-clamp-2">{emergencia.descripcion}</p>
              </div>
            )}

            {/* Botón */}
            <button
              onClick={() => onUnirse(emergencia)}
              disabled={uniendose === String(emergencia.id)}
              className="w-full px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {uniendose === String(emergencia.id) ? (
                <>
                  <svg
                    className="animate-spin h-4 w-4"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                  Uniéndose...
                </>
              ) : (
                <>
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"
                    />
                  </svg>
                  Unirse a Sala
                </>
              )}
            </button>
          </Card>
        ))}
      </div>
    </div>
  )
}
