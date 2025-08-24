export function Card({ children, className = "", onClick, hover = false }) {
  const baseClasses = "bg-white rounded-xl shadow border border-green-100 p-6";
  const hoverClasses = hover
    ? "hover:shadow-md transition-shadow cursor-pointer"
    : "";

  return (
    <div
      className={`${baseClasses} ${hoverClasses} ${className}`}
      onClick={onClick}
    >
      {children}
    </div>
  );
}

export function CardHeader({ children, className = "" }) {
  return (
    <div className={`flex items-center justify-between mb-4 ${className}`}>
      {children}
    </div>
  );
}

export function CardTitle({ children, className = "" }) {
  return (
    <span
      className={`text-lg font-bold font-serif text-green-900 ${className}`}
    >
      {children}
    </span>
  );
}

export function CardActions({ children, className = "" }) {
  return <div className={`flex gap-2 mt-4 ${className}`}>{children}</div>;
}
