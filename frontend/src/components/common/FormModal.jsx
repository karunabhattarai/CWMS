import Modal from "./Modal";
import { ErrorMessage } from "./Messages";
import { ModalButtons } from "./Button";

export default function FormModal({
  isOpen,
  onClose,
  onSubmit,
  title,
  submitText = "Save",
  submitVariant = "primary",
  maxWidth = "max-w-md",
  children,
  loading = false,
  error = "",
  clearError = null,
}) {
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (clearError) clearError();
    await onSubmit(e);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} maxWidth={maxWidth}>
      <form onSubmit={handleSubmit}>
        <ErrorMessage error={error} />
        {children}
        <ModalButtons
          onCancel={onClose}
          onSubmit={handleSubmit}
          submitText={submitText}
          submitVariant={submitVariant}
          loading={loading}
        />
      </form>
    </Modal>
  );
}
