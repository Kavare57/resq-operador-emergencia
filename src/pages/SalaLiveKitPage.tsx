import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { authService, salaService, valoracionService } from '../services/api'
import { NavBar, Card } from '../components/common'
import { LlamadaLiveKit } from '../components/sala'
import { CredencialesSala } from '../types'
import { useWebSocketEmergencias } from '../hooks/useWebSocketEmergencias'
import { useEmergencias } from '../context/EmergenciaContext'

export interface ValoracionEmergencia {
  solicitud_id: number
  descripcion: string
  tipoAmbulancia: 'BASICA' | 'MEDICALIZADA'
  nivelPrioridad: 'BAJA' | 'MEDIA' | 'ALTA'
  id_operador?: number
  solicitante_id?: number
}

type EstadoLlamada = 'esperando' | 'en_llamada' | 'valorando' | 'error'

export default function SalaLiveKitPage() {
  const navigate = useNavigate()
  const { isConnected: wsConnected, error: wsError, disconnect: wsDisconnect } = useWebSocketEmergencias()
  const { emergencias } = useEmergencias()
  const [estado, setEstado] = useState<EstadoLlamada>('esperando')
  const [solicitudActual, setSolicitudActual] = useState<any>(null)
  const [credenciales, setCredenciales] = useState<CredencialesSala | null>(null)
  const [error, setError] = useState<string | null>(null)
  const userData = localStorage.getItem('user')
  const user = userData ? JSON.parse(userData) : null

  useEffect(() => {
    const token = authService.getToken()
    if (!token) {
      navigate('/login')
      return
    }
  }, [navigate])

  // Escuchar la primera solicitud disponible (simularemos esto)
  useEffect(() => {
    if (emergencias && emergencias.length > 0 && !solicitudActual) {
      // La primera emergencia disponible es una "solicitud"
      const primeraSolicitud = emergencias[0]
      console.log('Solicitud recibida por WebSocket:', primeraSolicitud)
    }
  }, [emergencias, solicitudActual])

  const handleUnirseASala = async (solicitud: any) => {
    try {
      // Obtener salas activas
      const salasResponse = await salaService.obtenerSalasActivas()
      
      if (!salasResponse.success || !salasResponse.data) {
        throw new Error('No se pudieron obtener las salas activas')
      }

      const salas = (salasResponse.data as any).salas || []
      if (salas.length === 0) {
        throw new Error('No hay salas disponibles')
      }

      // Usar la primera sala disponible
      const salaDisponible = salas[0]
      
      // Obtener credenciales para unirse
      const credencialesResponse = await salaService.unirseASala(salaDisponible.name)
      
      if (credencialesResponse.success && credencialesResponse.data) {
        const creds = credencialesResponse.data as CredencialesSala
        
        // Guardar en localStorage
        localStorage.setItem('sala_credenciales', JSON.stringify({
          ...creds,
          solicitud_id: solicitud.id,
        }))

        // Actualizar estado y pasar directo a llamada
        setSolicitudActual(solicitud)
        setCredenciales(creds)
        setEstado('en_llamada')
      } else {
        throw new Error('Error al obtener credenciales de sala')
      }
    } catch (err) {
      console.error('Error uniéndose a sala:', err)
      setError((err as Error)?.message || 'Error desconocido')
      setEstado('error')
    }
  }

  const handleValoracion = async (emergenciaCreada: Emergencia, idAmbulanciaCercana?: number) => {
    try {
      console.log('🚑 [VALORACION] ========== handleValoracion EJECUTADO ==========')
      console.log('🚑 [VALORACION] handleValoracion recibido con emergencia:', emergenciaCreada)
      console.log('🚑 [VALORACION] handleValoracion recibido con idAmbulanciaCercana:', idAmbulanciaCercana, '(tipo:', typeof idAmbulanciaCercana, ')')
      console.log('🚑 [VALORACION] Argumentos recibidos:', { emergenciaCreada, idAmbulanciaCercana })
      
      if (!emergenciaCreada || !emergenciaCreada.id) {
        throw new Error('No se recibió una emergencia válida')
      }
      
      // Guardar en localStorage incluyendo id_ambulancia_cercana
      localStorage.setItem('sala_credenciales', JSON.stringify({
        ...credenciales,
        emergenciaId: emergenciaCreada.id,
        id_ambulancia_cercana: idAmbulanciaCercana,
      }))
      
      console.log('🚑 [VALORACION] Guardado en localStorage:', {
        emergenciaId: emergenciaCreada.id,
        id_ambulancia_cercana: idAmbulanciaCercana,
      })
      
      // Ir a despacho
      navigate('/despacho', {
        state: {
          emergencia: emergenciaCreada,
          id_ambulancia_cercana: idAmbulanciaCercana,
        },
      })
      
      console.log('🚑 [VALORACION] Navegando a despacho con id_ambulancia_cercana:', idAmbulanciaCercana)
    } catch (err) {
      console.error('Error en valoración:', err)
      setError((err as Error)?.message || 'Error desconocido')
      setEstado('error')
    }
  }

  const handleTerminarLlamada = () => {
    setEstado('esperando')
    setSolicitudActual(null)
    setCredenciales(null)
    setError(null)
  }

  const handleLogout = () => {
    authService.logout()
    wsDisconnect()
    localStorage.removeItem('sala_credenciales')
    navigate('/login')
  }

  // Estado: En llamada con formulario de valoración
  if (estado === 'en_llamada' && solicitudActual && credenciales) {
    return (
      <div className="min-h-screen bg-gray-900 flex flex-col">
        {/* Componente LlamadaLiveKit con modal de valoración */}
        <LlamadaLiveKit
          emergencia={solicitudActual}
          credenciales={credenciales}
          onTerminar={handleTerminarLlamada}
          onValoracionCompleta={async (emergenciaCreada: Emergencia, idAmbulanciaCercana?: number) => {
            console.log('🚑 [SALALIVEKIT] ========== WRAPPER EJECUTADO ==========')
            console.log('🚑 [SALALIVEKIT] onValoracionCompleta wrapper recibido con emergenciaCreada:', emergenciaCreada)
            console.log('🚑 [SALALIVEKIT] onValoracionCompleta wrapper recibido con idAmbulanciaCercana:', idAmbulanciaCercana, '(tipo:', typeof idAmbulanciaCercana, ')')
            console.log('🚑 [SALALIVEKIT] Llamando a handleValoracion con:', { emergenciaCreada, idAmbulanciaCercana })
            try {
              await handleValoracion(emergenciaCreada, idAmbulanciaCercana)
              console.log('🚑 [SALALIVEKIT] handleValoracion completado exitosamente')
            } catch (error) {
              console.error('🚑 [SALALIVEKIT] ERROR en handleValoracion:', error)
            }
          }}
        />
      </div>
    )
  }

  // Estado: Error
  if (estado === 'error') {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <NavBar title="ResQ - Sala de Emergencia" userName={user?.nombre} onLogout={handleLogout} />
        <main className="flex-1 flex items-center justify-center px-4">
          <Card className="p-8 text-center max-w-md bg-red-50 border border-red-200">
            <p className="text-red-800 text-lg font-semibold mb-4">❌ {error}</p>
            <button
              onClick={handleTerminarLlamada}
              className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Volver
            </button>
          </Card>
        </main>
      </div>
    )
  }

  // Estado: Esperando solicitudes (dashboard con WebSocket)
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <NavBar title="ResQ - Sala de Emergencia" userName={user?.nombre} onLogout={handleLogout} />
      
      <div className="bg-white border-b border-gray-200 px-4 py-2 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div
                className={`h-3 w-3 rounded-full ${wsConnected ? 'bg-green-500' : 'bg-red-500'}`}
                title={wsConnected ? 'Conectado a solicitudes' : 'Desconectado'}
              />
              <span className="text-sm text-gray-600">
                {wsConnected ? '✅ Esperando solicitudes de emergencia...' : '❌ Desconectado'}
              </span>
            </div>
            {wsError && <p className="text-sm text-red-600">{wsError}</p>}
          </div>
        </div>
      </div>

      <main className="flex-1 max-w-4xl mx-auto w-full px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Centro de Emergencias</h1>
          <p className="text-gray-600 mt-2">
            Aguardando solicitudes de emergencia. Cuando llegue una solicitud, aparecerá aquí.
          </p>
        </div>

        {emergencias && emergencias.length > 0 ? (
          <div className="space-y-4">
            {emergencias.map((emergencia) => (
              <Card key={emergencia.id} className="p-6 border-l-4 border-blue-500">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="font-bold text-lg text-gray-900">
                      📍 Solicitud #{emergencia.id}
                    </h3>
                    <p className="text-sm text-gray-600">
                      {emergencia.fechaHora
                        ? new Date(emergencia.fechaHora).toLocaleString()
                        : 'Hora no disponible'}
                    </p>
                  </div>
                </div>

                {/* Información del solicitante */}
                {emergencia.solicitante && (
                  <div className="mb-4 p-3 bg-gray-50 rounded">
                    <p className="text-sm font-semibold text-gray-900">
                      Solicitante: {emergencia.solicitante.nombre} {emergencia.solicitante.apellido}
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
                  <div className="mb-4 p-3 bg-blue-50 rounded">
                    <p className="text-xs text-gray-600 font-semibold mb-1">📍 Ubicación</p>
                    <p className="text-sm text-gray-700">
                      {emergencia.ubicacion.latitud}, {emergencia.ubicacion.longitud}
                    </p>
                    {emergencia.ubicacion.direccion && (
                      <p className="text-xs text-gray-600">{emergencia.ubicacion.direccion}</p>
                    )}
                  </div>
                )}

                {/* Botón unirse */}
                <button
                  onClick={() => handleUnirseASala(emergencia)}
                  className="w-full px-4 py-3 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center gap-2"
                >
                  <svg
                    className="h-5 w-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
                    />
                  </svg>
                  Unirse a Llamada
                </button>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="p-12 text-center">
            <div className="text-6xl mb-4">📞</div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">Esperando solicitudes...</h3>
            <p className="text-gray-600 mb-4">
              Los solicitantes que realicen una emergencia aparecerán aquí automáticamente.
            </p>
            <p className="text-sm text-gray-500">
              {wsConnected ? '✅ Conectado y escuchando' : '⏳ Reconectando...'}
            </p>
          </Card>
        )}
      </main>
    </div>
  )
}
