import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { authService, salaService } from '../services/api'
import { useWebSocketEmergencias } from '../hooks/useWebSocketEmergencias'
import { useEmergencias } from '../context/EmergenciaContext'
import { NavBar, Card } from '../components/common'
import { LlamadaLiveKit } from '../components/sala'
import EmergenciasEnVivo from '../components/dashboard/EmergenciasEnVivo'
import { Emergencia, CredencialesSala } from '../types'

type EstadoLlamada = 'esperando' | 'en_llamada' | 'error'

export interface ValoracionEmergencia {
  solicitud_id: number
  descripcion: string
  tipoAmbulancia: 'BASICA' | 'MEDICALIZADA'
  nivelPrioridad: 'BAJA' | 'MEDIA' | 'ALTA'
  id_operador?: number
  solicitante_id?: number
}

export default function DashboardPage() {
  const navigate = useNavigate()
  const { isConnected: wsConnected, error: wsError, disconnect: wsDisconnect } = useWebSocketEmergencias()
  const { emergencias } = useEmergencias()
  const [conectadoAWebSocket, setConectadoAWebSocket] = useState(true)
  const [reconectando, setReconectando] = useState(false)
  const [uniendose, setUniendose] = useState<string | null>(null)
  const [estado, setEstado] = useState<EstadoLlamada>('esperando')
  const [emergenciaActual, setEmergenciaActual] = useState<Emergencia | null>(null)
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

    // El WebSocket se conecta automáticamente a través del hook
    // Las emergencias se cargan directamente desde el contexto
  }, [navigate])

  const handleUnirseAEmergencia = async (emergencia: Emergencia) => {
    setUniendose(String(emergencia.id))
    try {
      // Usar el room que viene en la emergencia del WebSocket
      const nombreSala = emergencia.room || `emergencia-${emergencia.id}`
      console.log('Intentando unirse a sala:', nombreSala)

      const response = await salaService.unirseASala(nombreSala)
      if (response.success && response.data) {
        const creds = response.data as CredencialesSala
        console.log('Credenciales obtenidas:', creds)

        // Guardar en localStorage
        localStorage.setItem('sala_credenciales', JSON.stringify({
          token: creds.token,
          identity: creds.identity,
          room: creds.room,
          server_url: creds.server_url,
          emergenciaId: emergencia.id,
        }))

        // Actualizar estado para mostrar la llamada
        setEmergenciaActual(emergencia)
        setCredenciales(creds)
        setEstado('en_llamada')
        setError(null)
      } else {
        throw new Error(response.error || 'Error al unirse a la sala')
      }
    } catch (err) {
      const message = (err as Error)?.message || String(err)
      console.error('Error al unirse a emergencia:', err)
      setError(message)
      setEstado('error')
    } finally {
      setUniendose(null)
    }
  }

  const handleTerminarLlamada = () => {
    setEstado('esperando')
    setEmergenciaActual(null)
    setCredenciales(null)
    setError(null)
  }

  const handleValoracion = async (emergenciaCreada: Emergencia) => {
    try {
      // Ir a despacho con la emergencia creada
      navigate('/despacho', {
        state: {
          emergencia: emergenciaCreada,
        },
      })
    } catch (err) {
      console.error('Error en valoración:', err)
      setError((err as Error)?.message || 'Error desconocido')
      setEstado('error')
    }
  }

  const handleDesconectarWebSocket = async () => {
    console.log('Desconectando del WebSocket manualmente...')
    wsDisconnect()
    setConectadoAWebSocket(false)
  }

  const handleReconectarWebSocket = async () => {
    console.log('Reconectando al WebSocket...')
    setReconectando(true)
    try {
      // El WebSocket se reconecta automáticamente
      setConectadoAWebSocket(true)
    } catch (err) {
      console.error('Error reconectando:', err)
    } finally {
      setReconectando(false)
    }
  }

  const handleLogout = () => {
    authService.logout()
    navigate('/login')
  }

  // Si está en llamada, mostrar LlamadaLiveKit
  if (estado === 'en_llamada' && emergenciaActual && credenciales) {
    return (
      <div className="min-h-screen bg-gray-900 flex flex-col">
        <LlamadaLiveKit
          emergencia={emergenciaActual}
          credenciales={credenciales}
          onTerminar={handleTerminarLlamada}
          onValoracionCompleta={handleValoracion}
        />
      </div>
    )
  }

  // Si hay error, mostrar mensaje
  if (estado === 'error') {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <NavBar title="ResQ - Dashboard Operador" userName={user?.nombre} onLogout={handleLogout} />
        <main className="flex-1 flex items-center justify-center px-4">
          <Card className="p-8 text-center max-w-md bg-red-50 border border-red-200">
            <p className="text-red-800 text-lg font-semibold mb-4">❌ {error}</p>
            <button
              onClick={() => setEstado('esperando')}
              className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Volver
            </button>
          </Card>
        </main>
      </div>
    )
  }

  // Estado normal: esperando
  return (
    <div className="min-h-screen bg-gray-50">
      {/* NavBar */}
      <NavBar title="ResQ - Dashboard Operador" userName={user?.nombre} onLogout={handleLogout} />

      {/* WebSocket Status */}
      <div className="bg-white border-b border-gray-200 px-4 py-2 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div
                className={`h-3 w-3 rounded-full ${conectadoAWebSocket && wsConnected ? 'bg-green-500' : 'bg-red-500'}`}
                title={conectadoAWebSocket && wsConnected ? 'Conectado a emergencias' : 'Desconectado'}
              />
              <span className="text-sm text-gray-600">
                {conectadoAWebSocket && wsConnected ? '✅ Conectado a servidor de emergencias' : '❌ Desconectado'}
              </span>
            </div>
            {wsError && <p className="text-sm text-red-600">{wsError}</p>}
          </div>
          
          {/* Botón de Desconexión/Reconexión */}
          {conectadoAWebSocket ? (
            <button
              onClick={handleDesconectarWebSocket}
              className="px-3 py-1 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium flex items-center gap-2"
              title="Desconectarse del WebSocket para dejar de recibir solicitudes"
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
              Desconectar
            </button>
          ) : (
            <button
              onClick={handleReconectarWebSocket}
              disabled={reconectando}
              className="px-3 py-1 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400 transition-colors font-medium flex items-center gap-2"
              title="Reconectarse al WebSocket"
            >
              {reconectando ? (
                <>
                  <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Reconectando...
                </>
              ) : (
                <>
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.658 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                  </svg>
                  Reconectar
                </>
              )}
            </button>
          )}
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        {/* Mensaje de estado desconectado */}
        {!conectadoAWebSocket && (
          <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="flex items-start gap-3">
              <svg className="h-5 w-5 text-yellow-600 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              <div>
                <h3 className="font-semibold text-yellow-900">Desconectado del WebSocket</h3>
                <p className="text-yellow-800 text-sm mt-1">
                  No recibirás notificaciones de nuevas solicitudes de emergencia. Haz clic en "Reconectar" en la esquina superior derecha para volver a conectarte.
                </p>
              </div>
            </div>
          </div>
        )}

        <div className="mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Solicitudes de Emergencia en Vivo</h1>
            <p className="text-gray-600 mt-2">
              {emergencias.length === 0
                ? 'Esperando nuevas solicitudes de emergencia...'
                : `${emergencias.length} solicitud${emergencias.length !== 1 ? 'es' : ''} en tiempo real`}
            </p>
          </div>
        </div>

        {/* Info Box */}
        <Card className="mb-8 bg-blue-50 border border-blue-200">
          <div className="flex items-start gap-3">
            <div className="text-2xl">ℹ️</div>
            <div>
              <h3 className="font-semibold text-blue-900 mb-1">Cómo funciona</h3>
              <p className="text-blue-800 text-sm">
                Las solicitudes de emergencia aparecen en tiempo real a través del WebSocket.
                Cuando hagas clic en "Unirse a Sala", recibirás las credenciales necesarias
                para conectarte a la sala de LiveKit correspondiente.
              </p>
            </div>
          </div>
        </Card>

        {/* Emergencias Grid */}
        <EmergenciasEnVivo
          emergencias={emergencias}
          onUnirse={handleUnirseAEmergencia}
          uniendose={uniendose}
        />
      </main>
    </div>
  )
}

