export const formatDate = (date: string | Date): string => {
  const d = new Date(date)
  return d.toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export const formatTime = (date: string | Date): string => {
  const d = new Date(date)
  return d.toLocaleTimeString('es-ES', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  })
}

export const getStatusColor = (
  status: string
): 
  | 'bg-green-100 text-green-800'
  | 'bg-yellow-100 text-yellow-800'
  | 'bg-red-100 text-red-800'
  | 'bg-blue-100 text-blue-800'
  | 'bg-gray-100 text-gray-800' => {
  const statusMap: Record<string, string> = {
    activo: 'bg-green-100 text-green-800',
    disponible: 'bg-green-100 text-green-800',
    en_camino: 'bg-blue-100 text-blue-800',
    en_escena: 'bg-yellow-100 text-yellow-800',
    en_transporte: 'bg-blue-100 text-blue-800',
    en_descanso: 'bg-gray-100 text-gray-800',
    pendiente: 'bg-yellow-100 text-yellow-800',
    asignada: 'bg-blue-100 text-blue-800',
    en_progreso: 'bg-yellow-100 text-yellow-800',
    resuelta: 'bg-green-100 text-green-800',
    cancelada: 'bg-red-100 text-red-800',
    inactivo: 'bg-red-100 text-red-800',
  }
  return (statusMap[status] || 'bg-gray-100 text-gray-800') as 
    | 'bg-green-100 text-green-800'
    | 'bg-yellow-100 text-yellow-800'
    | 'bg-red-100 text-red-800'
    | 'bg-blue-100 text-blue-800'
    | 'bg-gray-100 text-gray-800'
}

export const getPriorityColor = (
  priority: string
): 'bg-green-100 text-green-800' | 'bg-yellow-100 text-yellow-800' | 'bg-orange-100 text-orange-800' | 'bg-red-100 text-red-800' => {
  const priorityMap: Record<
    string,
    'bg-green-100 text-green-800' | 'bg-yellow-100 text-yellow-800' | 'bg-orange-100 text-orange-800' | 'bg-red-100 text-red-800'
  > = {
    baja: 'bg-green-100 text-green-800',
    media: 'bg-yellow-100 text-yellow-800',
    alta: 'bg-orange-100 text-orange-800',
    crítica: 'bg-red-100 text-red-800',
  }
  return priorityMap[priority] || 'bg-gray-100 text-gray-800'
}

export const translateStatus = (status: string): string => {
  const statusMap: Record<string, string> = {
    activo: 'Activo',
    disponible: 'Disponible',
    en_camino: 'En camino',
    en_escena: 'En escena',
    en_transporte: 'En transporte',
    en_descanso: 'En descanso',
    disponible_en_hospital: 'Disponible en hospital',
    pendiente: 'Pendiente',
    asignada: 'Asignada',
    en_progreso: 'En progreso',
    resuelta: 'Resuelta',
    cancelada: 'Cancelada',
    inactivo: 'Inactivo',
  }
  return statusMap[status] || status
}

export const calculateTimeDifference = (startDate: string | Date, endDate?: string | Date): string => {
  const start = new Date(startDate).getTime()
  const end = endDate ? new Date(endDate).getTime() : Date.now()
  const diffMs = end - start
  const diffMins = Math.floor(diffMs / 60000)
  
  if (diffMins < 1) return 'Hace unos segundos'
  if (diffMins < 60) return `Hace ${diffMins} min`
  
  const diffHours = Math.floor(diffMins / 60)
  if (diffHours < 24) return `Hace ${diffHours}h`
  
  const diffDays = Math.floor(diffHours / 24)
  return `Hace ${diffDays}d`
}
