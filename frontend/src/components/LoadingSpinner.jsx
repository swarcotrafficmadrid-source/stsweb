export default function LoadingSpinner({ size = "md", className = "" }) {
  const sizeClasses = {
    sm: "w-4 h-4 border-2",
    md: "w-8 h-8 border-3",
    lg: "w-12 h-12 border-4"
  };

  return (
    <div className={`inline-block ${sizeClasses[size]} border-swarcoBlue border-t-transparent rounded-full animate-spin ${className}`} />
  );
}

export function FullPageLoader({ message = "Cargando..." }) {
  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl shadow-2xl p-8 flex flex-col items-center gap-4">
        <LoadingSpinner size="lg" />
        <p className="text-slate-700 font-medium">{message}</p>
      </div>
    </div>
  );
}
