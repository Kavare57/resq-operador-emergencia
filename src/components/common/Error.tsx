interface ErrorProps {
  message?: string
  onRetry?: () => void
}

export const Error: React.FC<ErrorProps> = ({ message = 'Ocurrió un error', onRetry }) => {
  return (
    <div className="rounded-lg border border-red-200 bg-red-50 p-6 text-center">
      <div className="mb-4 flex justify-center">
        <div className="text-4xl text-red-600">⚠️</div>
      </div>
      <p className="mb-4 text-red-800">{message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="rounded-lg bg-red-600 px-6 py-2 text-white transition hover:bg-red-700"
        >
          Intentar de nuevo
        </button>
      )}
    </div>
  )
}
