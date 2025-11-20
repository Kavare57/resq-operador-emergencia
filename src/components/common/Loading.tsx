interface LoadingProps {
  text?: string
}

export const Loading: React.FC<LoadingProps> = ({ text = 'Cargando...' }) => {
  return (
    <div className="flex items-center justify-center p-8">
      <div className="text-center">
        <div className="mb-4 inline-block">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-blue-200 border-t-blue-600"></div>
        </div>
        <p className="text-gray-600">{text}</p>
      </div>
    </div>
  )
}
