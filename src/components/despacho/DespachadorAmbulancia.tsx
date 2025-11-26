import { useState, useEffect } from 'react'
import { Card } from '../common'
import { Emergencia, Ambulancia } from '../../types'
import { ambulanciaService, apiClient } from '../../services/api'
import MapaAmbulancia from './MapaAmbulancia'

interface DespachadorAmbulanciaProps {
  emergencia: Emergencia
  onDespacho: (ambulancia: Ambulancia) => void
  cargando?: boolean
  idAmbulanciaClosest?: number
  ambulanciasUbicaciones?: Map<number, any> // Deprecated - ya no se usa, mantenido para compatibilidad
}

export default function DespachadorAmbulancia({
  emergencia,
  onDespacho,
  cargando = false,
  idAmbulanciaClosest,
  ambulanciasUbicaciones, // Deprecated - ya no se usa
}: DespachadorAmbulanciaProps) {
  const [ambulancias, setAmbulancias] = useState<Ambulancia[]>([])
  const [ambulanciaSeleccionada, setAmbulanciaSeleccionada] = useState<Ambulancia | null>(null)
  const [cargandoAmbulancia, setCargandoAmbulancia] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Calcular distancia entre dos puntos usando la fórmula de Haversine
  const calcularDistancia = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 6371 // Radio de la tierra en km
    const dLat = ((lat2 - lat1) * Math.PI) / 180
    const dLon = ((lon2 - lon1) * Math.PI) / 180
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLon / 2) * Math.sin(dLon / 2)
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
    return R * c // Distancia en km
  }

  useEffect(() => {
    const cargarAmbulancia = async () => {
      try {
        setCargandoAmbulancia(true)
        
        // Log cuando se recibe idAmbulanciaClosest
        console.log('🚑 [DESPACHO] DespachadorAmbulancia recibió idAmbulanciaClosest:', idAmbulanciaClosest, '(tipo:', typeof idAmbulanciaClosest, ')')
        
        // SIMPLIFICADO: Usar SOLO la ambulancia provista por el backend
        if (idAmbulanciaClosest === undefined || idAmbulanciaClosest === null) {
          console.error('❌ [DESPACHO] ERROR CRÍTICO: idAmbulanciaClosest no está disponible. El backend debe proporcionar este valor.')
          setError('Error: No se recibió la ambulancia sugerida por el sistema. Por favor, intenta valorar la emergencia nuevamente.')
          setCargandoAmbulancia(false)
          return
        }
        
        const response = await ambulanciaService.obtenerAmbulancia()
        
        if (response.success && response.data) {
          // Filtrar ambulancias por disponibilidad y tipo
          const ambulanciasDisponibles = (Array.isArray(response.data) ? response.data : []).filter(
            (amb: any) => amb.disponibilidad === true && amb.tipoAmbulancia === emergencia.tipoAmbulancia
          )
          
          console.log('🚑 [DESPACHO] Ambulancias disponibles:', ambulanciasDisponibles.map((a: any) => ({ id: a.id, tipo: a.tipoAmbulancia })))
          
          // Buscar SOLO la ambulancia sugerida por el backend
          const ambulanciaSugerida = ambulanciasDisponibles.find(
            (amb: Ambulancia) => amb.id === idAmbulanciaClosest
          )
          
          if (!ambulanciaSugerida) {
            console.error(`❌ [DESPACHO] ERROR: Ambulancia ${idAmbulanciaClosest} sugerida por backend NO está disponible`)
            console.log('🚑 [DESPACHO] IDs de ambulancias disponibles:', ambulanciasDisponibles.map((a: any) => a.id))
            setError(`La ambulancia ${idAmbulanciaClosest} sugerida por el sistema no está disponible. Por favor contacta al administrador.`)
            setCargandoAmbulancia(false)
            return
          }
          
          console.log(`✅ [DESPACHO] Ambulancia sugerida por backend encontrada y seleccionada: ${idAmbulanciaClosest}`)
          
          // Cargar información del operador de ambulancia si está disponible
          if (ambulanciaSugerida.id_operador_ambulancia) {
            try {
              const operadorResponse = await apiClient.get(`/operadores-ambulancia/${ambulanciaSugerida.id_operador_ambulancia}`)
              
              if (operadorResponse.success && operadorResponse.data) {
                const operadorData = operadorResponse.data as any
                console.log('🚑 [DESPACHO] Operador de ambulancia cargado:', operadorData)
                // Agregar información del operador a la ambulancia
                ambulanciaSugerida.operador = {
                  id: operadorData.id?.toString() || '',
                  email: operadorData.email || '',
                  nombre: operadorData.nombre || '',
                  apellido: operadorData.apellido || '',
                  rol: 'operador' as const,
                  estado: 'activo' as const,
                  licencia: operadorData.licencia, // Agregar licencia al objeto operador
                } as any
              }
            } catch (err) {
              console.warn('⚠️ [DESPACHO] No se pudo cargar información del operador:', err)
            }
          }
          
          // Establecer todas las ambulancias disponibles para mostrarlas en el mapa
          setAmbulancias(ambulanciasDisponibles)
          
          // Seleccionar SOLO la ambulancia sugerida por el backend
          setAmbulanciaSeleccionada(ambulanciaSugerida)
          
          console.log('🚑 [DESPACHO] Ambulancia seleccionada (única opción del backend):', ambulanciaSugerida.id)
        } else {
          setError('Error al cargar las ambulancias')
        }
      } catch (err) {
        console.error('Error cargando ambulancias:', err)
        setError(`Error: ${(err as Error)?.message || 'Desconocido'}`)
      } finally {
        setCargandoAmbulancia(false)
      }
    }

    cargarAmbulancia()
  }, [emergencia.tipoAmbulancia, emergencia.ubicacion, idAmbulanciaClosest])

  // ELIMINADO: Lógica del WebSocket - ya no se usa
  // La ubicación de la ambulancia viene directamente de la base de datos

  const handleDespacho = () => {
    if (ambulanciaSeleccionada) {
      onDespacho(ambulanciaSeleccionada)
    } else {
      alert('Por favor selecciona una ambulancia')
    }
  }

  const esMasCercana = ambulanciaSeleccionada && idAmbulanciaClosest && ambulanciaSeleccionada.id === idAmbulanciaClosest
  const distanciaAmbulancia =
    ambulanciaSeleccionada && 
    emergencia.ubicacion?.latitud && 
    emergencia.ubicacion?.longitud && 
    ambulanciaSeleccionada.ubicacion?.latitud && 
    ambulanciaSeleccionada.ubicacion?.longitud
      ? calcularDistancia(
          emergencia.ubicacion.latitud,
          emergencia.ubicacion.longitud,
          ambulanciaSeleccionada.ubicacion.latitud,
          ambulanciaSeleccionada.ubicacion.longitud
        )
      : null

  return (
    <div className="flex gap-6 h-full">
      {/* Mapa - Lado izquierdo (70%) */}
      <div className="flex-1 min-w-0">
        <Card className="h-full p-4">
          {cargandoAmbulancia ? (
            <div className="w-full h-full flex items-center justify-center bg-gray-100 rounded-lg">
              <div className="text-center">
                <svg
                  className="animate-spin h-8 w-8 text-blue-600 mx-auto"
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
                <p className="text-gray-600 mt-4">Cargando ambulancias disponibles...</p>
              </div>
            </div>
          ) : error ? (
            <div className="w-full h-full flex items-center justify-center bg-red-50 rounded-lg border border-red-200">
              <div className="text-center">
                <p className="text-red-800 font-semibold">❌ {error}</p>
              </div>
            </div>
          ) : (
            <MapaAmbulancia
              emergencia={emergencia}
              ambulancias={ambulancias}
              ambulanciaSeleccionada={ambulanciaSeleccionada || undefined}
              onAmbulanciaSelected={setAmbulanciaSeleccionada}
            />
          )}
        </Card>
      </div>

      {/* Panel de información - Lado derecho (30%) */}
      <div className="w-96 flex flex-col gap-4">
        {/* Panel de Información de Ambulancia */}
        {ambulanciaSeleccionada ? (
          <Card className="p-5 flex-1 min-h-0 overflow-y-auto">
            {/* Información Básica de la Ambulancia */}
            <div className="space-y-4">
              {/* Placa */}
              <div>
                <p className="text-xs text-gray-600 font-semibold uppercase tracking-wide mb-1">Placa</p>
                <p className="text-lg font-bold text-gray-800">{ambulanciaSeleccionada.placa || `Ambulancia ${ambulanciaSeleccionada.id}`}</p>
              </div>

              {/* Tipo */}
              <div>
                <p className="text-xs text-gray-600 font-semibold uppercase tracking-wide mb-1">Tipo</p>
                <p className="text-md text-gray-700">
                  {ambulanciaSeleccionada.tipoAmbulancia === 'BASICA' ? 'Ambulancia Básica' : 'Ambulancia Medicalizada'}
                </p>
              </div>

              {/* Información del Operador de Ambulancia */}
              {ambulanciaSeleccionada.operador && (
                <div className="border-t pt-4 mt-4">
                  <p className="text-xs text-gray-600 font-semibold uppercase tracking-wide mb-3">Operador de Ambulancia</p>
                  <div className="bg-blue-50 p-3 rounded-lg space-y-2">
                    {/* Nombre y Apellido */}
                    <div>
                      <p className="text-xs text-blue-600 font-semibold uppercase tracking-wide mb-1">Nombre</p>
                      <p className="text-md text-blue-800">
                        {ambulanciaSeleccionada.operador.nombre} {ambulanciaSeleccionada.operador.apellido}
                      </p>
                    </div>
                    
                    {/* Licencia */}
                    {(ambulanciaSeleccionada.operador as any).licencia && (
                      <div>
                        <p className="text-xs text-blue-600 font-semibold uppercase tracking-wide mb-1">Número de Licencia</p>
                        <p className="text-md text-blue-800 font-mono">{(ambulanciaSeleccionada.operador as any).licencia}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
              
              {/* Mostrar mensaje si no hay operador asignado */}
              {!ambulanciaSeleccionada.operador && ambulanciaSeleccionada.id_operador_ambulancia && (
                <div className="border-t pt-4 mt-4">
                  <p className="text-xs text-gray-500 italic">Información del operador no disponible</p>
                </div>
              )}

              {/* Botón de Despacho */}
              <button
                onClick={handleDespacho}
                disabled={cargando || cargandoAmbulancia}
                className="w-full px-4 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-6"
              >
                {cargando ? (
                  <>
                    <svg
                      className="animate-spin h-5 w-5"
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
                    Despachando...
                  </>
                ) : (
                  <>
                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M13 10V3L4 14h7v7l9-11h-7z"
                      />
                    </svg>
                    Despachar
                  </>
                )}
              </button>
            </div>
          </Card>
        ) : (
          <Card className="p-5 flex-1 min-h-0 overflow-y-auto">
            <div className="flex items-center justify-center h-full text-center">
              <div>
                <p className="text-gray-500 text-sm">Cargando información de la ambulancia...</p>
              </div>
            </div>
          </Card>
        )}

        {/* Panel de Información de Emergencia */}
        <Card className="p-5 flex-shrink-0">
          <h3 className="text-lg font-bold text-gray-800 mb-4">Emergencia</h3>

          <div className="bg-blue-50 p-4 rounded-lg space-y-3">
            <div>
              <p className="text-xs text-blue-600 font-semibold uppercase tracking-wide">ID</p>
              <p className="text-lg font-bold text-blue-800">#{emergencia.id}</p>
            </div>

            <div>
              <p className="text-xs text-blue-600 font-semibold uppercase tracking-wide">Tipo de Ambulancia</p>
              <p className="text-md text-blue-800">{emergencia.tipoAmbulancia === 'BASICA' ? 'Básica' : 'Medicalizada'}</p>
            </div>

            <div>
              <p className="text-xs text-blue-600 font-semibold uppercase tracking-wide">Nivel de Prioridad</p>
              <p className="text-md font-semibold text-red-600">{emergencia.nivelPrioridad}</p>
            </div>

            {emergencia.ubicacion?.latitud && emergencia.ubicacion?.longitud && (
              <div>
                <p className="text-xs text-blue-600 font-semibold uppercase tracking-wide">Ubicación</p>
                <p className="text-sm text-blue-700 font-mono">{emergencia.ubicacion.latitud.toFixed(4)}, {emergencia.ubicacion.longitud.toFixed(4)}</p>
              </div>
            )}
          </div>
        </Card>
      </div>
    </div>
  )
}
