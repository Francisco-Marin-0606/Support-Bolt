import React from "react";

export const Modal = ({ children, onClose }: { children: React.ReactNode; onClose: () => void }) => {
  return (
    <div className="m-0 fixed inset-0 bg-black/90 flex items-center justify-center z-[9999]" onClick={onClose}>
      <div className="relative" onClick={e => e.stopPropagation()}>
        {children}
      </div>
    </div>
  );
};

interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  loading?: boolean;
}

export const ConfirmModal = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  title, 
  message, 
  confirmText = "Confirmar",
  cancelText = "Cancelar",
  loading = false 
}: ConfirmModalProps) => {
  if (!isOpen) return null;

  return (
    <Modal onClose={onClose}>
      <div className="bg-card border border-border rounded-lg p-6 max-w-md w-full mx-4">
        <h3 className="text-lg font-semibold text-foreground mb-4">{title}</h3>
        <p className="text-muted-foreground mb-6">{message}</p>

        <div className="flex justify-end gap-3">
          <button
            onClick={onClose}
            disabled={loading}
            className="px-4 py-2 text-muted-foreground border border-border rounded-lg hover:bg-accent transition-colors disabled:opacity-50"
          >
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-colors disabled:opacity-50 flex items-center gap-2"
          >
            {loading && (
              <div className="w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin"></div>
            )}
            {confirmText}
          </button>
        </div>
      </div>
    </Modal>
  );
};