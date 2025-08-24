export default function StatusBadge({
  status,
  className = "",
  statusStyles = null,
}) {
  // Default status styles
  const defaultStyles = {
    active: "bg-green-100 text-green-800",
    inactive: "bg-gray-100 text-gray-600",
    pending: "bg-yellow-100 text-yellow-800",
    completed: "bg-blue-100 text-blue-800",
    cancelled: "bg-red-100 text-red-800",
    draft: "bg-purple-100 text-purple-800",
  };

  const styles = statusStyles || defaultStyles;
  const statusClass = styles[status] || styles.inactive;

  return (
    <span
      className={`px-3 py-1 rounded-full text-xs font-semibold capitalize ${statusClass} ${className}`}
    >
      {status}
    </span>
  );
}
