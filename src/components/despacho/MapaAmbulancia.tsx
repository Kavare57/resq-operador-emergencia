import { useEffect, useState } from 'react'
import { MapContainer, TileLayer, Marker, useMap } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { Emergencia, Ambulancia } from '../../types'

interface MapaAmbulanciaProps {
  emergencia?: Emergencia
  ambulancias: Ambulancia[]
  ambulanciaSeleccionada?: Ambulancia
  onAmbulanciaSelected?: (ambulancia: Ambulancia) => void
}

// Componente para invalidar el tamaño del mapa cuando el contenedor cambia
function MapInvalidator() {
  const map = useMap()
  
  useEffect(() => {
    setTimeout(() => {
      map.invalidateSize()
    }, 100)
  }, [map])
  
  return null
}

// Crear icono personalizado para emergencia (naranja)
const createEmergenciaIcon = () => {
  return L.divIcon({
    html: `
      <div style="
        width: 40px;
        height: 40px;
        background-color: #ff8c42;
        border: 3px solid #fff;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        box-shadow: 0 2px 8px rgba(0,0,0,0.3);
        font-size: 20px;
      ">
        📍
      </div>
    `,
    iconSize: [40, 40],
    iconAnchor: [20, 20],
    popupAnchor: [0, -15],
    className: 'custom-icon-emergencia',
  })
}

// Crear icono personalizado para ambulancia azul
const createAmbulanciaIcon = (isSelected: boolean = false) => {
  const borderColor = isSelected ? '#ff8c42' : '#3b82f6'
  const borderWidth = isSelected ? 4 : 3
  
  return L.divIcon({
    html: `
      <div style="
        width: ${isSelected ? 50 : 40}px;
        height: ${isSelected ? 50 : 40}px;
        background-color: #3b82f6;
        border: ${borderWidth}px solid ${borderColor};
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        box-shadow: 0 2px 8px rgba(0,0,0,0.3);
        font-size: 20px;
        transition: all 0.2s;
      ">
        🚑
      </div>
    `,
    iconSize: [isSelected ? 50 : 40, isSelected ? 50 : 40],
    iconAnchor: [isSelected ? 25 : 20, isSelected ? 25 : 20],
    popupAnchor: [0, -20],
    className: 'custom-icon-ambulancia',
  })
}

export default function MapaAmbulancia({
  emergencia,
  ambulancias,
  ambulanciaSeleccionada,
  onAmbulanciaSelected,
}: MapaAmbulanciaProps) {
  const [errorMapa, setErrorMapa] = useState<string | null>(null)

  // Validar que tenemos ubicación de emergencia
  if (!emergencia?.ubicacion?.latitud || !emergencia?.ubicacion?.longitud) {
    setErrorMapa('No se pudo obtener la ubicacion de la emergencia')
    return (
      <div className="w-full h-full flex items-center justify-center bg-gray-100 rounded-lg">
        <div className="text-center">
          <p className="text-gray-600">📍 No se pudo cargar la ubicación</p>
          <p className="text-sm text-gray-500 mt-1">{errorMapa}</p>
        </div>
      </div>
    )
  }

  const emergenciaLatLng: [number, number] = [emergencia.ubicacion.latitud, emergencia.ubicacion.longitud]

  return (
    <div className="w-full h-full rounded-lg overflow-hidden border border-gray-300">
      <MapContainer
        center={emergenciaLatLng}
        zoom={14}
        scrollWheelZoom={true}
        className="w-full h-full"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
          url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
        />
        
        <MapInvalidator />

        {/* Marcador de emergencia - Naranja */}
        <Marker 
          position={emergenciaLatLng} 
          icon={createEmergenciaIcon()}
          title="Ubicación de emergencia"
        />

        {/* Marcadores de ambulancias - Azul */}
        {ambulancias.map((ambulancia) => {
          if (!ambulancia.ubicacion?.latitud || !ambulancia.ubicacion?.longitud) {
            return null
          }

          const ambulanciaLatLng: [number, number] = [
            ambulancia.ubicacion.latitud,
            ambulancia.ubicacion.longitud,
          ]

          const isSelected = ambulanciaSeleccionada?.id === ambulancia.id

          return (
            <Marker
              key={ambulancia.id}
              position={ambulanciaLatLng}
              icon={createAmbulanciaIcon(isSelected)}
              eventHandlers={{
                click: () => onAmbulanciaSelected?.(ambulancia),
              }}
              title={`${ambulancia.placa} - ${ambulancia.tipoAmbulancia}`}
            />
          )
        })}
      </MapContainer>

      {errorMapa && (
        <div className="absolute top-4 left-4 bg-red-50 border border-red-200 rounded-lg p-3">
          <p className="text-sm text-red-800">❌ {errorMapa}</p>
        </div>
      )}
    </div>
  )
}
