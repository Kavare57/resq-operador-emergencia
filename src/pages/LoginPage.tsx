import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { authService } from '../services/api'
import { Error } from '../components/common'

export default function LoginPage() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const response = await authService.login(email, password)
      if (response.success && response.data) {
        const authData = response.data as { access_token: string; token_type: string; expires_in: number }
        
        // Guardar token
        localStorage.setItem('access_token', authData.access_token)
        
        // Decodificar token para obtener ID y otros datos
        const tokenParts = authData.access_token.split('.')
        let userId = null
        
        if (tokenParts.length === 3) {
          try {
            const decoded = JSON.parse(atob(tokenParts[1]))
            userId = decoded.sub || decoded.id || decoded.user_id
          } catch (err) {
            console.error('Error decodificando token:', err)
          }
        }
        
        // Crear un objeto de usuario con la información disponible
        const userData = {
          id: userId || email, // Usar email como fallback para id
          email: email,
          nombre: email.split('@')[0], // Usar parte del email como nombre temporal
          apellido: '',
          rol: 'operador',
          estado: 'activo',
        }
        localStorage.setItem('user', JSON.stringify(userData))
        
        // Navegar al dashboard
        navigate('/dashboard')
      } else {
        setError(response.error || 'Error en el login')
      }
    } catch (err: unknown) {
      const error = err as Error
      if (error && error.message) {
        setError(error.message)
      } else {
        setError('Error en el login')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 to-blue-900 flex items-center justify-center px-4">
      <div className="bg-white rounded-xl shadow-2xl p-8 w-full max-w-md">
        <div className="mb-8 text-center">
          <div className="h-12 w-12 bg-blue-600 rounded-lg mx-auto mb-4"></div>
          <h1 className="text-3xl font-bold text-gray-900">ResQ</h1>
          <p className="text-gray-600 text-sm mt-1">Sistema de Emergencias</p>
        </div>

        {error && <Error message={error} />}

        <form onSubmit={handleSubmit} className="space-y-5 mt-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
              placeholder="operador@resq.com"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Contraseña
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
              placeholder="••••••••"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 rounded-lg transition disabled:opacity-50"
          >
            {loading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
          </button>
        </form>
      </div>
    </div>
  )
}
