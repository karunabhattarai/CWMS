import React from "react";

export default function Container({
  children,
  variant = "default",
  maxWidth = "max-w-7xl",
  className = "",
  ...props
}) {
  const baseClasses = "mx-auto px-4 sm:px-6 lg:px-8";

  const variants = {
    default: "py-6",
    card: "bg-white rounded-lg shadow-md p-6 mb-6",
    compact: "py-4",
    full: "w-full",
  };

  const variantClasses = variants[variant] || variants.default;

  return (
    <div
      className={`${baseClasses} ${maxWidth} ${variantClasses} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}
