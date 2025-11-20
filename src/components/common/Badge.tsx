interface BadgeProps {
  label: string
  className?: string
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'info'
}

const variantClasses = {
  default: 'bg-gray-100 text-gray-800',
  success: 'bg-green-100 text-green-800',
  warning: 'bg-yellow-100 text-yellow-800',
  danger: 'bg-red-100 text-red-800',
  info: 'bg-blue-100 text-blue-800',
}

export const Badge: React.FC<BadgeProps> = ({ label, className = '', variant = 'default' }) => {
  return (
    <span className={`inline-block rounded-full px-3 py-1 text-sm font-medium ${variantClasses[variant]} ${className}`}>
      {label}
    </span>
  )
}
