// Auth Types
export interface LoginCredentials {
  email: string;
  password: string;
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
}

export interface User {
  id?: string;
  email: string;
  nombre: string;
  apellido: string;
  rol: 'operador' | 'admin' | 'supervisor';
  estado: 'activo' | 'inactivo' | 'en_descanso';
}

export interface DecodedToken {
  sub: string;
  exp: number;
  iat: number;
}

// Emergency Types (Solicitud del backend)
export interface Emergencia {
  id?: string | number;
  solicitante: Solicitante;
  ubicacion: Ubicacion;
  fechaHora: string;
  // Campos opcionales que pueden venir del WebSocket
  numero_emergencia?: string;
  descripcion?: string;
  tipo?: string;
  prioridad?: 'baja' | 'media' | 'alta' | 'crítica';
  estado?: 'pendiente' | 'asignada' | 'en_progreso' | 'resuelta' | 'cancelada';
  fecha_creacion?: string;
  fecha_asignacion?: string;
  operador_asignado?: User;
  ambulancias_asignadas?: Ambulancia[];
  // Campos del WebSocket
  room?: string;
  server_url?: string;
  timestamp?: string;
}

export interface Ubicacion {
  id?: string | number;
  latitud: number;
  longitud: number;
  direccion?: string;
  ciudad?: string;
  referencia?: string;
  fechaHora?: string;
}

export interface Solicitante {
  id?: string | number;
  nombre: string;
  apellido: string;
  tipoDocumento?: string;
  numeroDocumento?: string;
  telefono?: string;
  email?: string;
  nombre2?: string;
  apellido2?: string;
  padecimientos?: string[];
}

export interface Ambulancia {
  id: string;
  numero_unidad: string;
  estado: 'disponible' | 'en_camino' | 'en_escena' | 'en_transporte' | 'disponible_en_hospital';
  operador: User;
  ubicacion: Ubicacion;
  tipo: 'basica' | 'intermedia' | 'avanzada';
}

// Queue Types
export interface Queue {
  id: string;
  emergencias: Emergencia[];
  total: number;
}

// API Response Types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
}
