import Button from '@/components/Button';
import Modal from '@/components/Modal';

type ConfirmModalProps = {
  open: boolean;
  title?: string;
  children?: React.ReactNode;
  cancelLabel?: string;
  confirmLabel?: string;
  confirmVariant?: 'primary' | 'secondary' | 'danger' | 'gray';
  loading?: boolean;
  onCancel: () => void;
  onConfirm: () => void;
};

export default function ConfirmModal({
  open,
  title = 'Confirm',
  children,
  cancelLabel = 'Cancel',
  confirmLabel = 'Delete',
  confirmVariant = 'danger',
  loading = false,
  onCancel,
  onConfirm,
}: ConfirmModalProps) {
  return (
    <Modal isOpen={open} onClose={onCancel} className="w-full max-w-md p-6">
      <h3 className="text-lg font-semibold mb-4">{title}</h3>
      <div className="text-sm text-gray-600 mb-6">{children}</div>
      <div className="flex justify-end space-x-3">
        <Button variant="secondary" size="sm" onClick={onCancel}>{cancelLabel}</Button>
        <Button variant={confirmVariant} size="sm" onClick={onConfirm} disabled={loading}>{loading ? `${confirmLabel}...` : confirmLabel}</Button>
      </div>
    </Modal>
  );
}
