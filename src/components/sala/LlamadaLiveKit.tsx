import { useState } from 'react'
import { CredencialesSala, Emergencia } from '../../types'
import FormularioValoracionEnLlamada from './FormularioValoracionEnLlamada.tsx'

interface LlamadaLiveKitProps {
  emergencia: Emergencia
  credenciales: CredencialesSala
  onValoracionCompleta: (data: any) => void
  onTerminar: () => void
}

export default function LlamadaLiveKit({
  emergencia,
  credenciales,
  onValoracionCompleta,
  onTerminar,
}: LlamadaLiveKitProps) {
  const [audioEnabled, setAudioEnabled] = useState(true)
  const [mostrarValoracion, setMostrarValoracion] = useState(false)

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
    : new Date().toLocaleString()

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 flex flex-col">
      {/* Header con estado de conexión */}
      <div className="bg-gray-800 p-4 flex items-center justify-between border-b border-gray-700">
        <div className="flex items-center gap-2">
          <div className="h-3 w-3 rounded-full bg-green-500" />
          <span className="text-sm font-medium text-green-400">
            Conectado a {credenciales.room}
          </span>
        </div>
        <button
          onClick={onTerminar}
          className="text-white hover:bg-gray-700 p-2 rounded"
          title="Cerrar llamada"
        >
          <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Contenedor principal */}
      <div className="flex-1 flex flex-col items-center justify-center px-4 py-8">
        {/* Información del solicitante */}
        <div className="text-center max-w-sm mb-8">
          <div className="bg-red-500 rounded-full h-32 w-32 mx-auto flex items-center justify-center mb-4 text-white text-5xl font-bold">
            {solicitante.nombre.charAt(0).toUpperCase()}
          </div>
          <h2 className="text-2xl font-bold text-white mb-1">{solicitante.nombre}</h2>
          <p className="text-gray-400">Solicitante</p>
          {solicitante.documento && (
            <p className="text-xs text-gray-500 mt-2">
              {solicitante.tipo}: {solicitante.documento}
            </p>
          )}
          <p className="text-xs text-gray-500 mt-1">📅 {fechaCreacion}</p>
        </div>

        {/* Ubicación si existe */}
        {emergencia.ubicacion && (
          <div className="text-center mb-8 max-w-sm">
            <p className="text-sm text-gray-300 mb-2">📍 Ubicación de la emergencia</p>
            <p className="text-xs text-gray-400">
              {emergencia.ubicacion.latitud.toFixed(4)}, {emergencia.ubicacion.longitud.toFixed(4)}
            </p>
            {emergencia.ubicacion.direccion && (
              <p className="text-xs text-gray-400 mt-1">{emergencia.ubicacion.direccion}</p>
            )}
          </div>
        )}
      </div>

      {/* Controles inferiores */}
      <div className="bg-gray-800 border-t border-gray-700 p-6">
        {/* Botones de audio/video */}
        <div className="flex justify-center gap-6 mb-6">
          {/* Micrófono */}
          <button
            onClick={() => setAudioEnabled(!audioEnabled)}
            className={`rounded-full h-16 w-16 flex items-center justify-center transition-all ${
              audioEnabled
                ? 'bg-red-500 hover:bg-red-600'
                : 'bg-gray-600 hover:bg-gray-700 opacity-50'
            }`}
            title={audioEnabled ? 'Desactivar micrófono' : 'Activar micrófono'}
          >
            <svg className="h-6 w-6 text-white" fill="currentColor" viewBox="0 0 20 20">
              <path d="M7 4a3 3 0 016 0v4a3 3 0 11-6 0V4zm4 10.93A7.001 7.001 0 0017 8a1 1 0 10-2 0A5 5 0 015 8a1 1 0 002 0 7.001 7.001 0 006 6.93V17H9a1 1 0 100 2h2a1 1 0 100-2h-1v-2.07z" />
            </svg>
          </button>

          {/* Altavoz */}
          <button
            onClick={() => {}}
            className="rounded-full h-16 w-16 flex items-center justify-center bg-blue-500 hover:bg-blue-600 transition-all"
            title="Altavoz"
          >
            <svg className="h-6 w-6 text-white" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9 4a1 1 0 012 0v5a1 1 0 11-2 0V4zm0 11a1 1 0 012 0v2a1 1 0 11-2 0v-2zm0-6a3 3 0 100 6 3 3 0 000-6z" />
            </svg>
          </button>

          {/* Colgar */}
          <button
            onClick={onTerminar}
            className="rounded-full h-16 w-16 flex items-center justify-center bg-red-600 hover:bg-red-700 transition-all"
            title="Colgar"
          >
            <svg className="h-6 w-6 text-white" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M3.72 4.72a.75.75 0 011.06 0l10.94 10.94a.75.75 0 11-1.06 1.06L3.72 5.78a.75.75 0 010-1.06zM15 5a1 1 0 100-2 1 1 0 000 2zm0 12a1 1 0 100-2 1 1 0 000 2zM5 15a1 1 0 100-2 1 1 0 000 2zm10-5a1 1 0 100-2 1 1 0 000 2zM5 5a1 1 0 100-2 1 1 0 000 2z"
                clipRule="evenodd"
              />
            </svg>
          </button>
        </div>

        {/* Botón de valoración */}
        <button
          onClick={() => setMostrarValoracion(true)}
          className="w-full px-6 py-3 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center gap-2"
        >
          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          Valorar Emergencia
        </button>
      </div>

      {/* Modal de Valoración */}
      {mostrarValoracion && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 p-4 flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900">Valorar Emergencia</h2>
              <button
                onClick={() => setMostrarValoracion(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="p-6">
              <FormularioValoracionEnLlamada
                solicitudId={Number(emergencia.id)}
                solicitanteNombre={solicitante.nombre}
                solicitanteId={emergencia.solicitante?.id ? Number(emergencia.solicitante.id) : 1}
                onValoracion={async (data: any) => {
                  await onValoracionCompleta(data)
                  setMostrarValoracion(false)
                }}
                onCancel={() => setMostrarValoracion(false)}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
