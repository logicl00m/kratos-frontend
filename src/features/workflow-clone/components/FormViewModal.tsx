// src/features/workflow/components/FormViewModal.tsx
import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import FormViewer from '@features/form/components/FormViewer';
import type { WorkflowConfig } from '../types/workflow.types';
import "./FormViewModal.css";

interface FormViewModalProps {
  nodeId: string;
  workflow: WorkflowConfig;
  isOpen: boolean;
  onClose: () => void;
}

const FormViewModal: React.FC<FormViewModalProps> = ({
  nodeId,
  workflow,
  isOpen,
  onClose,
}) => {
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  // Validate workflow structure before passing to FormViewer
  useEffect(() => {
    if (!workflow?.workflow) {
      setError('Invalid workflow configuration: Missing workflow property');
      return;
    }

    const { states } = workflow.workflow;
    if (!states || !states[nodeId]) {
      setError(`State '${nodeId}' not found in workflow`);
      return;
    }

    setError(null);
  }, [nodeId, workflow]);

  // If there's an error, display it
  if (error) {
    return (
      <div className="form-view-modal">
        <div className="form-view-modal-content">
          <div className="form-viewer">
            <div className="form-header">
              <button className="back-btn" onClick={onClose}>
                <X size={16} />
                Close
              </button>
              <h2>Error</h2>
            </div>
            <div className="form-content">
              <p className="text-red-500 dark:text-red-400">{error}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="form-view-modal">
      <div className="form-view-modal-content">
        <FormViewer
          stateName={nodeId}
          workflow={workflow}
          currentState={nodeId}
          onBack={onClose}
          onSubmit={(data) => {
            console.log('Form submitted', data);
          }}
          onReject={(data) => {
            console.log('Form rejected', data);
          }}
        />
      </div>
    </div>
  );
};

export default FormViewModal;