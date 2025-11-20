import { Emergencia } from '../../types'
import { Badge } from '../common/Badge'
import { getPriorityColor, formatTime } from '../../utils/helpers'

interface EmergenciaQueueProps {
  emergencias: Emergencia[]
  onSelect?: (emergencia: Emergencia) => void
  isLoading?: boolean
}

export const EmergenciaQueue: React.FC<EmergenciaQueueProps> = ({
  emergencias,
  onSelect,
  isLoading,
}) => {
  if (isLoading) {
    return <div className="text-center text-gray-500">Cargando emergencias...</div>
  }

  if (emergencias.length === 0) {
    return (
      <div className="rounded-lg border-2 border-dashed border-gray-300 p-8 text-center">
        <p className="text-gray-500">No hay emergencias en la cola</p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {emergencias.map((emergencia) => {
        const numeroEmergencia = emergencia.numero_emergencia || `Solicitud #${emergencia.id}`
        const direccion = emergencia.ubicacion?.direccion || `Lat: ${emergencia.ubicacion?.latitud}, Lon: ${emergencia.ubicacion?.longitud}`
        const prioridad = emergencia.prioridad || 'media'
        const estado = emergencia.estado || 'pendiente'
        const fecha = emergencia.fecha_creacion || emergencia.fechaHora
        const descripcion = emergencia.descripcion || `${emergencia.solicitante?.nombre} ${emergencia.solicitante?.apellido}`

        return (
          <div
            key={emergencia.id}
            onClick={() => onSelect?.(emergencia)}
            className={`rounded-lg border border-gray-200 bg-white p-4 transition ${
              onSelect ? 'cursor-pointer hover:border-blue-500 hover:shadow-md' : ''
            }`}
          >
            <div className="mb-3 flex items-start justify-between">
              <div>
                <p className="font-semibold text-gray-900">{numeroEmergencia}</p>
                <p className="text-sm text-gray-600">{direccion}</p>
              </div>
              <Badge
                label={prioridad}
                variant={prioridad === 'crítica' ? 'danger' : 'warning'}
              />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">{descripcion}</p>
              </div>
              <Badge label={estado} className={getPriorityColor(prioridad)} />
            </div>
            <div className="mt-2 text-xs text-gray-500">
              Reportada: {formatTime(fecha)}
            </div>
          </div>
        )
      })}
    </div>
  )
}
