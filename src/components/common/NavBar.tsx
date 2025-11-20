interface NavBarProps {
  title?: string
  onLogout?: () => void
  userName?: string
}

export const NavBar: React.FC<NavBarProps> = ({ title = 'ResQ Dashboard', onLogout, userName }) => {
  return (
    <nav className="border-b border-gray-200 bg-white shadow-sm">
      <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-lg bg-blue-600"></div>
            <h1 className="text-xl font-bold text-gray-900">{title}</h1>
          </div>
          <div className="flex items-center gap-4">
            {userName && <span className="text-sm text-gray-600">{userName}</span>}
            {onLogout && (
              <button
                onClick={onLogout}
                className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-red-700"
              >
                Cerrar sesión
              </button>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}
