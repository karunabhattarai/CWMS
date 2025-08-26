import React from "react";

export default function LoadingSpinner({
  text = "Loading...",
  size = "md",
  className = "",
  ...props
}) {
  const sizeClasses = {
    sm: "h-4 w-4",
    md: "h-8 w-8",
    lg: "h-12 w-12",
  };

  const spinnerSize = sizeClasses[size] || sizeClasses.md;

  return (
    <div className={`text-center ${className}`} {...props}>
      <div
        className={`animate-spin rounded-full ${spinnerSize} border-b-2 border-cyan-600 mx-auto mb-2`}
      ></div>
      {text && <p className="text-cyan-700 text-sm">{text}</p>}
    </div>
  );
}
