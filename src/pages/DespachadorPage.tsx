import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { authService, ambulanciaService } from '../services/api'
import { NavBar, Card } from '../components/common'
import { DespachadorAmbulancia } from '../components/despacho'
import { Emergencia, Ambulancia, CredencialesSala } from '../types'
import { useEmergencias } from '../context/EmergenciaContext'

interface LocationState {
  emergencia?: Emergencia
  id_ambulancia_cercana?: number
}

export default function DespachadorPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const { ambulanciasUbicaciones } = useEmergencias()
  const [emergencia, setEmergencia] = useState<Emergencia | null>(null)
  const [idAmbulanciaClosest, setIdAmbulanciaClosest] = useState<number | undefined>(undefined)
  const [cargando, setCargando] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const userData = localStorage.getItem('user')
  const user = userData ? JSON.parse(userData) : null

  useEffect(() => {
    const token = authService.getToken()
    if (!token) {
      navigate('/login')
      return
    }

    // Primero, intentar obtener emergencia desde state (viene de SalaLiveKitPage)
    const state = location.state as LocationState | null
    if (state?.emergencia) {
      // Asegurarse de que tiene ubicación
      let emergenciaConUbicacion = state.emergencia
      if (!emergenciaConUbicacion.ubicacion && emergenciaConUbicacion.solicitud?.ubicacion) {
        emergenciaConUbicacion = {
          ...emergenciaConUbicacion,
          ubicacion: emergenciaConUbicacion.solicitud.ubicacion,
        }
      }
      setEmergencia(emergenciaConUbicacion)
      setIdAmbulanciaClosest(state.id_ambulancia_cercana)
      
      // Guardar en localStorage para referencia
      localStorage.setItem('sala_credenciales', JSON.stringify({
        emergenciaId: emergenciaConUbicacion.id,
        id_ambulancia_cercana: state.id_ambulancia_cercana,
      }))
      return
    }

    // Fallback: obtener desde localStorage
    const credencialesStr = localStorage.getItem('sala_credenciales')
    if (credencialesStr) {
      try {
        const credenciales = JSON.parse(credencialesStr) as CredencialesSala & { emergenciaId?: number }
        
        if (!credenciales.emergenciaId) {
          setError('No se encontró el ID de la emergencia')
          return
        }

        // Obtener emergencia desde localStorage
        const emergenciasStr = localStorage.getItem('emergencias_activas')
        if (emergenciasStr) {
          const emergencias = JSON.parse(emergenciasStr) as any[]
          const emergenciaEncontrada = emergencias.find((e) => e.id === credenciales.emergenciaId)
          
          if (emergenciaEncontrada) {
            // Asegurarse de que tiene ubicación
            if (!emergenciaEncontrada.ubicacion) {
              emergenciaEncontrada.ubicacion = emergenciaEncontrada.solicitud?.ubicacion
            }
            setEmergencia(emergenciaEncontrada)
          } else {
            setError(`No se encontró la emergencia con ID ${credenciales.emergenciaId}`)
          }
        } else {
          setError('No hay emergencias cargadas')
        }
      } catch (err) {
        console.error('Error cargando emergencia:', err)
        setError(`Error: ${(err as Error)?.message || 'Desconocido'}`)
      }
    } else {
      setError('No se encontraron credenciales de sala')
    }
  }, [navigate, location])

  const handleDespacho = async (ambulancia: Ambulancia) => {
    if (!emergencia) {
      setError('Emergencia no cargada')
      return
    }

    setCargando(true)
    setError(null)

    try {
      // Obtener datos del usuario para operador_emergencia_id
      const userStr = localStorage.getItem('user')
      const currentUser = userStr ? JSON.parse(userStr) : null
      
      if (!currentUser || !currentUser.id) {
        throw new Error('Usuario no autenticado - Por favor inicia sesión nuevamente')
      }

      // Convertir id a número si es posible, si no usar 1 como fallback
      let operadorEmergenciaId = 0
      if (typeof currentUser.id === 'number') {
        operadorEmergenciaId = currentUser.id
      } else if (typeof currentUser.id === 'string') {
        const parsed = parseInt(currentUser.id)
        operadorEmergenciaId = isNaN(parsed) ? 1 : parsed
      }

      if (operadorEmergenciaId === 0) {
        throw new Error('No se pudo obtener el ID del operador')
      }

      // Validar que la ambulancia tenga operador asignado
      if (!ambulancia.id_operador_ambulancia) {
        throw new Error('La ambulancia seleccionada no tiene un operador asignado. Por favor selecciona otra ambulancia.')
      }

      // Despachar ambulancia
      const response = await ambulanciaService.despacharAmbulancia({
        emergencia_id: emergencia.id as number,
        ambulancia_id: ambulancia.id as number,
        operador_ambulancia_id: ambulancia.id_operador_ambulancia,
        operador_emergencia_id: operadorEmergenciaId,
      })

      if (response.success) {
        alert('✅ Ambulancia despachada exitosamente')
        
        // Limpiar localStorage
        localStorage.removeItem('sala_credenciales')
        localStorage.removeItem('emergencias_activas')
        
        // Navegar a dashboard
        navigate('/dashboard')
      } else {
        setError(response.error || 'Error despachando la ambulancia')
      }
    } catch (err) {
      const message = (err as Error)?.message || String(err)
      console.error('Error en despacho:', err)
      setError(`Error: ${message}`)
    } finally {
      setCargando(false)
    }
  }

  const handleLogout = () => {
    authService.logout()
    localStorage.removeItem('sala_credenciales')
    localStorage.removeItem('emergencias_activas')
    navigate('/login')
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* NavBar */}
      <NavBar title="ResQ - Despacho de Ambulancia" userName={user?.nombre} onLogout={handleLogout} />

      {/* Main Content */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Despacho de Ambulancia</h1>
          <p className="text-gray-600 mt-2">
            Selecciona la ambulancia más cercana o disponible para despacharla a la emergencia.
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <Card className="mb-6 bg-red-50 border border-red-200">
            <div className="flex items-start gap-3">
              <div className="text-2xl">❌</div>
              <div>
                <h3 className="font-semibold text-red-900 mb-1">Error</h3>
                <p className="text-red-800 text-sm">{error}</p>
              </div>
            </div>
          </Card>
        )}

        {/* Loading Message */}
        {!emergencia && !error && (
          <Card className="p-6 bg-yellow-50 border border-yellow-200">
            <div className="flex items-start gap-3">
              <div className="text-2xl">⏳</div>
              <div>
                <h3 className="font-semibold text-yellow-900 mb-1">Cargando emergencia</h3>
                <p className="text-yellow-800 text-sm">
                  Por favor espera mientras se carga la información de la emergencia...
                </p>
              </div>
            </div>
          </Card>
        )}

        {/* Despacho Component */}
        {emergencia && (
          <div className="h-screen">
            <DespachadorAmbulancia
              emergencia={emergencia}
              onDespacho={handleDespacho}
              cargando={cargando}
              idAmbulanciaClosest={idAmbulanciaClosest}
              ambulanciasUbicaciones={ambulanciasUbicaciones}
            />
          </div>
        )}
      </main>
    </div>
  )
}
