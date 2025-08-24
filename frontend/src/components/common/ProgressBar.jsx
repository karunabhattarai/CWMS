export default function ProgressBar({
  progress,
  className = "",
  showLabel = true,
  size = "md",
  color = "green",
}) {
  const sizes = {
    sm: "h-1",
    md: "h-2",
    lg: "h-3",
  };

  const colors = {
    green: {
      bg: "bg-green-100",
      fill: "bg-green-500",
      text: "text-green-700",
    },
    blue: {
      bg: "bg-blue-100",
      fill: "bg-blue-500",
      text: "text-blue-700",
    },
    red: {
      bg: "bg-red-100",
      fill: "bg-red-500",
      text: "text-red-700",
    },
  };

  const colorClasses = colors[color];

  return (
    <div className={className}>
      <div className={`w-full ${colorClasses.bg} rounded-full ${sizes[size]}`}>
        <div
          className={`${colorClasses.fill} ${sizes[size]} rounded-full transition-all duration-300`}
          style={{ width: `${Math.min(Math.max(progress, 0), 100)}%` }}
        />
      </div>
      {showLabel && (
        <div className={`text-xs ${colorClasses.text} mt-1`}>
          {Math.round(progress)}% complete
        </div>
      )}
    </div>
  );
}
