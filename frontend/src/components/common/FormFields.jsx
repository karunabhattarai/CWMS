export function FormInput({ label, error, className = "", ...props }) {
  return (
    <div className={`mb-4 ${className}`}>
      {label && (
        <label className="block text-sm font-medium mb-1 text-gray-700">
          {label}
        </label>
      )}
      <input
        className={`w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
          error ? "border-red-500" : "border-gray-300"
        }`}
        {...props}
      />
      {error && <div className="text-red-600 text-sm mt-1">{error}</div>}
    </div>
  );
}

export function FormTextarea({ label, error, className = "", ...props }) {
  return (
    <div className={`mb-4 ${className}`}>
      {label && (
        <label className="block text-sm font-medium mb-1 text-gray-700">
          {label}
        </label>
      )}
      <textarea
        className={`w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-vertical ${
          error ? "border-red-500" : "border-gray-300"
        }`}
        rows={3}
        {...props}
      />
      {error && <div className="text-red-600 text-sm mt-1">{error}</div>}
    </div>
  );
}

export function FormSelect({
  label,
  error,
  children,
  className = "",
  ...props
}) {
  return (
    <div className={`mb-4 ${className}`}>
      {label && (
        <label className="block text-sm font-medium mb-1 text-gray-700">
          {label}
        </label>
      )}
      <select
        className={`w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
          error ? "border-red-500" : "border-gray-300"
        }`}
        {...props}
      >
        {children}
      </select>
      {error && <div className="text-red-600 text-sm mt-1">{error}</div>}
    </div>
  );
}
