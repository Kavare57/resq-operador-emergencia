import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { authService, emergenciaService } from '../services/api'
import { useEmergencias } from '../context/EmergenciaContext'
import { useWebSocketEmergencias } from '../hooks/useWebSocketEmergencias'
import { NavBar, Card, Loading, Error, Badge } from '../components/common'
import { EmergenciaQueue } from '../components/dashboard/EmergenciaQueue'
import { OperatorStatus } from '../components/dashboard/OperatorStatus'
import { Emergencia } from '../types'

export default function DashboardPage() {
  const navigate = useNavigate()
  const { emergencias, addEmergencia, selectEmergencia, selectedEmergencia } = useEmergencias()
  const { isConnected: wsConnected, error: wsError } = useWebSocketEmergencias()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const userData = localStorage.getItem('user')
  const user = userData ? JSON.parse(userData) : null

  useEffect(() => {
    const token = authService.getToken()
    if (!token) {
      navigate('/login')
      return
    }

    cargarDatos()
  }, [navigate])

  const cargarDatos = async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await emergenciaService.obtenerEmergencias()
      if (response.success && response.data) {
        const emergenciasData = response.data as Emergencia[]
        emergenciasData.forEach((e) => addEmergencia(e))
      } else {
        setError(response.error || 'Error cargando emergencias')
      }
    } catch (err) {
      setError('Error al cargar los datos')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = () => {
    authService.logout()
    navigate('/login')
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* NavBar */}
      <NavBar title="ResQ - Dashboard Operador" userName={user?.nombre} onLogout={handleLogout} />

      {/* WebSocket Status */}
      <div className="bg-white border-b border-gray-200 px-4 py-2 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div
              className={`h-3 w-3 rounded-full ${wsConnected ? 'bg-green-500' : 'bg-red-500'}`}
              title={wsConnected ? 'Conectado a emergencias' : 'Desconectado'}
            />
            <span className="text-sm text-gray-600">
              {wsConnected ? '✅ Conectado a servidor de emergencias' : '❌ Desconectado'}
            </span>
          </div>
          {wsError && <p className="text-sm text-red-600">{wsError}</p>}
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <div className="text-center">
              <p className="text-gray-600 text-sm font-medium">Total Emergencias</p>
              <p className="text-4xl font-bold text-blue-600 mt-2">{emergencias.length}</p>
            </div>
          </Card>
          <Card>
            <div className="text-center">
              <p className="text-gray-600 text-sm font-medium">Pendientes</p>
              <p className="text-4xl font-bold text-yellow-600 mt-2">
                {emergencias.filter((e) => e.estado === 'pendiente').length}
              </p>
            </div>
          </Card>
          <Card>
            <div className="text-center">
              <p className="text-gray-600 text-sm font-medium">En Progreso</p>
              <p className="text-4xl font-bold text-orange-600 mt-2">
                {emergencias.filter((e) => e.estado === 'en_progreso').length}
              </p>
            </div>
          </Card>
          <Card>
            <div className="text-center">
              <p className="text-gray-600 text-sm font-medium">Resueltas</p>
              <p className="text-4xl font-bold text-green-600 mt-2">
                {emergencias.filter((e) => e.estado === 'resuelta').length}
              </p>
            </div>
          </Card>
        </div>

        {/* Error Display */}
        {error && <Error message={error} onRetry={cargarDatos} />}

        {/* Loading */}
        {loading && <Loading text="Cargando dashboard..." />}

        {/* Main Grid */}
        {!loading && !error && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Cola de Emergencias */}
            <div className="lg:col-span-2">
              <Card>
                <div className="mb-6">
                  <h2 className="text-2xl font-bold text-gray-900">Cola de Emergencias</h2>
                  <p className="text-gray-600 text-sm mt-1">
                    {emergencias.length} emergencias registradas
                  </p>
                </div>
                <EmergenciaQueue
                  emergencias={emergencias}
                  onSelect={(e) => selectEmergencia(e)}
                />
              </Card>
            </div>

            {/* Detalles de Emergencia Seleccionada */}
            <div>
              <Card>
                {selectedEmergencia ? (
                  <div className="space-y-4">
                    <h3 className="text-lg font-bold text-gray-900">Detalles de Emergencia</h3>
                    <div className="border-t pt-4 space-y-3">
                      <div>
                        <p className="text-xs font-medium text-gray-500 uppercase">Número</p>
                        <p className="text-gray-900 font-semibold">
                          {selectedEmergencia.numero_emergencia || `Solicitud #${selectedEmergencia.id}`}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs font-medium text-gray-500 uppercase">Solicitante</p>
                        <p className="text-gray-900">
                          {selectedEmergencia.solicitante?.nombre} {selectedEmergencia.solicitante?.apellido}
                        </p>
                        {selectedEmergencia.solicitante?.numeroDocumento && (
                          <p className="text-xs text-gray-600">
                            {selectedEmergencia.solicitante.tipoDocumento}: {selectedEmergencia.solicitante.numeroDocumento}
                          </p>
                        )}
                      </div>
                      <div>
                        <p className="text-xs font-medium text-gray-500 uppercase">Ubicación</p>
                        <p className="text-gray-900">{selectedEmergencia.ubicacion?.direccion || 'No especificada'}</p>
                        <p className="text-xs text-gray-600 mt-1">
                          {selectedEmergencia.ubicacion?.ciudad || ''} | Lat: {selectedEmergencia.ubicacion?.latitud.toFixed(4)}, Lon: {selectedEmergencia.ubicacion?.longitud.toFixed(4)}
                        </p>
                      </div>
                      {selectedEmergencia.prioridad && (
                        <div>
                          <p className="text-xs font-medium text-gray-500 uppercase">Prioridad</p>
                          <Badge label={selectedEmergencia.prioridad} variant="warning" />
                        </div>
                      )}
                      {selectedEmergencia.estado && (
                        <div>
                          <p className="text-xs font-medium text-gray-500 uppercase">Estado</p>
                          <Badge label={selectedEmergencia.estado} variant="info" />
                        </div>
                      )}
                      {selectedEmergencia.descripcion && (
                        <div>
                          <p className="text-xs font-medium text-gray-500 uppercase">Descripción</p>
                          <p className="text-gray-900 text-sm">{selectedEmergencia.descripcion}</p>
                        </div>
                      )}
                      <div>
                        <p className="text-xs font-medium text-gray-500 uppercase">Reportada</p>
                        <p className="text-gray-900 text-sm">
                          {new Date(selectedEmergencia.fechaHora || selectedEmergencia.fecha_creacion || '').toLocaleString()}
                        </p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-gray-500">Selecciona una emergencia para ver detalles</p>
                  </div>
                )}
              </Card>

              {/* Estado de Operadores */}
              {user && (
                <Card className="mt-6">
                  <h3 className="text-lg font-bold text-gray-900 mb-4">Tu Estado</h3>
                  <OperatorStatus operator={user} />
                </Card>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
