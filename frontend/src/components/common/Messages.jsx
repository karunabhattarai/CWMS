export function ErrorMessage({ error, className = "" }) {
  if (!error) return null;

  return (
    <div
      className={`text-red-600 text-sm mb-4 p-2 bg-red-50 border border-red-200 rounded ${className}`}
    >
      {error}
    </div>
  );
}

export function SuccessMessage({ message, className = "" }) {
  if (!message) return null;

  return (
    <div
      className={`text-green-600 text-sm mb-4 p-2 bg-green-50 border border-green-200 rounded ${className}`}
    >
      {message}
    </div>
  );
}

export function InfoMessage({ message, className = "" }) {
  if (!message) return null;

  return (
    <div
      className={`text-blue-600 text-sm mb-4 p-2 bg-blue-50 border border-blue-200 rounded ${className}`}
    >
      {message}
    </div>
  );
}
