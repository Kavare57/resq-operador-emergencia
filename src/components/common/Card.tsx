interface CardProps {
  children: React.ReactNode
  className?: string
  onClick?: () => void
}

export const Card: React.FC<CardProps> = ({ children, className = '', onClick }) => {
  return (
    <div
      onClick={onClick}
      className={`rounded-lg border border-gray-200 bg-white p-6 shadow-sm transition ${
        onClick ? 'cursor-pointer hover:shadow-md' : ''
      } ${className}`}
    >
      {children}
    </div>
  )
}
