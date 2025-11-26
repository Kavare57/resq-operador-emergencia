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
  solicitud?: {
    id?: number | string;
    solicitante?: Solicitante;
    fechaHora?: string;
    ubicacion?: Ubicacion;
  };
  solicitante: Solicitante;
  ubicacion: Ubicacion;
  fechaHora: string;
  // Campos de valoración
  estado?: 'CREADA' | 'ASIGNADA' | 'EN_PROGRESO' | 'RESUELTA' | 'CANCELADA';
  tipoAmbulancia?: 'BASICA' | 'MEDICALIZADA';
  nivelPrioridad?: 'BAJA' | 'MEDIA' | 'ALTA';
  descripcion?: string;
  id_operador?: number | string;
  // Campos opcionales
  numero_emergencia?: string;
  tipo?: string;
  prioridad?: 'baja' | 'media' | 'alta' | 'crítica';
  fecha_creacion?: string;
  fecha_asignacion?: string;
  operador_asignado?: User;
  ambulancias_asignadas?: Ambulancia[];
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
  id: number | string;
  placa?: string;
  numero_unidad?: string;
  disponibilidad?: boolean;
  estado?: 'disponible' | 'en_camino' | 'en_escena' | 'en_transporte' | 'disponible_en_hospital';
  operador?: User;
  id_operador_ambulancia?: number | null;
  tipoAmbulancia?: 'BASICA' | 'MEDICALIZADA' | 'basica' | 'intermedia' | 'avanzada';
  tipo?: 'basica' | 'intermedia' | 'avanzada';
  ubicacion: {
    id?: number;
    latitud: number;
    longitud: number;
    ciudad?: string;
    direccion?: string;
    fechaHora?: string;
  };
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

// Sala Types (LiveKit)
export interface Sala {
  nombre: string;
  personas_conectadas: number;
  capacidad: number;
}

export interface SalaActiva {
  name: string; // Nombre de la sala (ej: "emergencia-123")
  personas_conectadas: string; // Formato "X/2"
}

export interface CredencialesSala {
  token: string;
  identity: string;
  room: string;
  server_url: string;
}

// Valoración de Emergencia
export interface ValoracionEmergencia {
  solicitud_id: number
  tipoAmbulancia: 'BASICA' | 'MEDICALIZADA'
  nivelPrioridad: 'BAJA' | 'MEDIA' | 'ALTA'
  descripcion: string
  id_operador: number
  solicitante_id: number
}

export interface ValoracionResponse {
  emergencia_id: number
  estado: string
  ambulancia_asignada?: {
    id: number
    numero_unidad: string
    ubicacion: Ubicacion
  }
}

export interface DespachadorAmbulanciaPayload {
  emergencia_id: number
  ambulancia_id: number
  operador_ambulancia_id: number
  operador_emergencia_id: number
}

