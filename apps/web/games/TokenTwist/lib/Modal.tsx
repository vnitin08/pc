import React, { ReactNode } from 'react';

interface ModalProps {
  children: ReactNode;
  onClose: () => void;
}

export default function Modal({ children, onClose }: ModalProps) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 text-black">
      <div className="bg-black p-4 rounded shadow-lg text-black">
        {children}
        <button className="mt-4" onClick={onClose}>
          Close
        </button>
      </div>
    </div>
  );
}
