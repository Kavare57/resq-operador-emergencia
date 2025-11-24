import { Card } from '../common'
import { Emergencia } from '../../types'

interface SolicitudEmergenciaProps {
  emergencia: Emergencia
  onUnirse: () => void
  uniendose: boolean
}

export default function SolicitudEmergencia({
  emergencia,
  onUnirse,
  uniendose,
}: SolicitudEmergenciaProps) {
  const getSolicitanteInfo = () => {
    if (emergencia.solicitante) {
      return {
        nombre: `${emergencia.solicitante.nombre} ${emergencia.solicitante.apellido || ''}`,
        documento: emergencia.solicitante.numeroDocumento,
        tipo: emergencia.solicitante.tipoDocumento,
      }
    }
    return { nombre: 'Desconocido', documento: '', tipo: '' }
  }

  const solicitante = getSolicitanteInfo()
  const fechaCreacion = emergencia.fechaHora
    ? new Date(emergencia.fechaHora).toLocaleString()
    : 'Hora desconocida'

  return (
    <Card className="p-6 hover:shadow-lg transition-shadow border-l-4 border-blue-500">
      <div className="flex items-start gap-4">
        {/* Avatar */}
        <div className="bg-blue-500 rounded-full h-16 w-16 flex items-center justify-center text-white text-xl font-bold flex-shrink-0">
          {solicitante.nombre.charAt(0).toUpperCase()}
        </div>

        {/* Información */}
        <div className="flex-1">
          <h3 className="font-bold text-lg text-gray-900 mb-1">{solicitante.nombre}</h3>
          
          <div className="space-y-1 text-sm text-gray-600 mb-3">
            {solicitante.documento && (
              <p>
                <span className="font-medium">{solicitante.tipo}:</span> {solicitante.documento}
              </p>
            )}
            <p className="flex items-center gap-1">
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              {fechaCreacion}
            </p>
          </div>

          {/* Descripción si existe */}
          {emergencia.descripcion && (
            <p className="text-sm text-gray-700 mb-3 line-clamp-2 bg-gray-50 p-2 rounded">
              {emergencia.descripcion}
            </p>
          )}

          {/* Botón */}
          <button
            onClick={onUnirse}
            disabled={uniendose}
            className="w-full px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {uniendose ? (
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
                Conectando...
              </>
            ) : (
              <>
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
                  />
                </svg>
                Unirse a Sala
              </>
            )}
          </button>
        </div>

        {/* ID de emergencia en esquina superior derecha */}
        <div className="text-right flex-shrink-0">
          <p className="text-xs text-gray-500">Emergencia</p>
          <p className="text-lg font-bold text-gray-900">#{emergencia.id}</p>
        </div>
      </div>
    </Card>
  )
}
