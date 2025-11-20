import { User } from '../../types'
import { Badge } from '../common/Badge'
import { getStatusColor, translateStatus } from '../../utils/helpers'

interface OperatorStatusProps {
  operator: User
  onStatusChange?: (status: 'activo' | 'en_descanso' | 'inactivo') => void
}

export const OperatorStatus: React.FC<OperatorStatusProps> = ({ operator, onStatusChange }) => {
  return (
    <div className="rounded-lg border border-gray-200 bg-white p-6">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">Estado del Operador</h3>
        <Badge
          label={translateStatus(operator.estado)}
          className={getStatusColor(operator.estado)}
        />
      </div>
      <div className="mb-6 space-y-2">
        <p className="text-gray-600">
          <span className="font-medium">Nombre:</span> {operator.nombre} {operator.apellido}
        </p>
        <p className="text-gray-600">
          <span className="font-medium">Email:</span> {operator.email}
        </p>
        <p className="text-gray-600">
          <span className="font-medium">Rol:</span> {operator.rol}
        </p>
      </div>
      {onStatusChange && (
        <div className="grid grid-cols-3 gap-2">
          <button
            onClick={() => onStatusChange('activo')}
            className={`rounded-lg px-4 py-2 text-sm font-medium transition ${
              operator.estado === 'activo'
                ? 'bg-green-600 text-white'
                : 'border border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
            }`}
          >
            Activo
          </button>
          <button
            onClick={() => onStatusChange('en_descanso')}
            className={`rounded-lg px-4 py-2 text-sm font-medium transition ${
              operator.estado === 'en_descanso'
                ? 'bg-yellow-600 text-white'
                : 'border border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
            }`}
          >
            Descanso
          </button>
          <button
            onClick={() => onStatusChange('inactivo')}
            className={`rounded-lg px-4 py-2 text-sm font-medium transition ${
              operator.estado === 'inactivo'
                ? 'bg-red-600 text-white'
                : 'border border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
            }`}
          >
            Inactivo
          </button>
        </div>
      )}
    </div>
  )
}
