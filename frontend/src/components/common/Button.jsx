export function Button({
  variant = "primary",
  size = "md",
  loading = false,
  disabled = false,
  children,
  className = "",
  ...props
}) {
  const baseStyles =
    "font-medium rounded focus:outline-none focus:ring-2 transition-colors";

  const variants = {
    primary: "bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500",
    secondary:
      "bg-gray-200 text-gray-700 hover:bg-gray-300 focus:ring-gray-500",
    success: "bg-green-600 text-white hover:bg-green-700 focus:ring-green-500",
    danger: "bg-red-600 text-white hover:bg-red-700 focus:ring-red-500",
    warning:
      "bg-yellow-600 text-white hover:bg-yellow-700 focus:ring-yellow-500",
  };

  const sizes = {
    sm: "px-3 py-1 text-sm",
    md: "px-4 py-2",
    lg: "px-6 py-3 text-lg",
  };

  const isDisabled = disabled || loading;

  return (
    <button
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${
        isDisabled ? "opacity-50 cursor-not-allowed" : ""
      } ${className}`}
      disabled={isDisabled}
      {...props}
    >
      {loading ? (
        <div className="flex items-center">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
          {children}
        </div>
      ) : (
        children
      )}
    </button>
  );
}

export function ModalButtons({
  onCancel,
  onSubmit,
  submitText = "Save",
  cancelText = "Cancel",
  loading = false,
  submitVariant = "primary",
}) {
  return (
    <div className="flex justify-end gap-2 mt-6">
      <Button variant="secondary" onClick={onCancel} disabled={loading}>
        {cancelText}
      </Button>
      <Button
        variant={submitVariant}
        onClick={onSubmit}
        loading={loading}
        type="submit"
      >
        {loading ? "..." : submitText}
      </Button>
    </div>
  );
}
