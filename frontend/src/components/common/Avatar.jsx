export function Avatar({ name, size = "md", className = "", onClick }) {
  const sizes = {
    sm: "w-6 h-6 text-xs",
    md: "w-8 h-8 text-sm",
    lg: "w-10 h-10 text-base",
  };

  const initial = name?.[0]?.toUpperCase() || "?";

  return (
    <div
      className={`${
        sizes[size]
      } rounded-full border-2 border-white flex items-center justify-center bg-green-100 text-green-800 font-bold ${
        onClick ? "cursor-pointer hover:bg-green-200" : ""
      } ${className}`}
      title={name}
      onClick={onClick}
    >
      {initial}
    </div>
  );
}

export function AvatarGroup({
  members = [],
  maxVisible = 5,
  size = "md",
  className = "",
}) {
  const visibleMembers = members.slice(0, maxVisible);
  const remainingCount = Math.max(0, members.length - maxVisible);

  return (
    <div className={`flex -space-x-2 ${className}`}>
      {visibleMembers.map((member, idx) => (
        <Avatar key={member._id || idx} name={member.name} size={size} />
      ))}
      {remainingCount > 0 && (
        <div
          className={`${
            size === "sm"
              ? "w-6 h-6 text-xs"
              : size === "lg"
              ? "w-10 h-10 text-base"
              : "w-8 h-8 text-sm"
          } rounded-full border-2 border-white flex items-center justify-center bg-gray-100 text-gray-600 font-bold`}
          title={`+${remainingCount} more`}
        >
          +{remainingCount}
        </div>
      )}
    </div>
  );
}
