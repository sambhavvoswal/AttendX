import { Modal } from './Modal';
import { Button } from './Button';

export function ConfirmDialog({ isOpen, onClose, onConfirm, title, message, confirmText = "Confirm", cancelText = "Cancel", danger = false }) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title}>
      <p className="text-text-secondary mb-6">{message}</p>
      <div className="flex justify-end gap-3">
        <Button variant="ghost" onClick={onClose}>{cancelText}</Button>
        <Button variant={danger ? "danger" : "primary"} onClick={() => {
          onConfirm();
          onClose();
        }}>
          {confirmText}
        </Button>
      </div>
    </Modal>
  );
}
