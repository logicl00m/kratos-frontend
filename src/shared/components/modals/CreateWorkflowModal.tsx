import React from "react";
import { useNavigate } from "react-router-dom";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { FileText, Workflow, ArrowRight } from "lucide-react";
import "./CreateWorkflowModal.css";

interface CreateWorkflowModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface ActionCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  buttonText: string;
  onClick: () => void;
}

const ActionCard: React.FC<ActionCardProps> = ({
  icon,
  title,
  description,
  buttonText,
  onClick,
}) => {
  return (
    <button 
      className="w-full p-0 bg-transparent border-0 outline-none"
      onClick={onClick}
    >
      <div className="create-workflow-action-card w-full h-full">
        <div className="create-workflow-action-card-header">
          <div className="create-workflow-icon-wrapper">
            {icon}
          </div>
          <h3 className="create-workflow-action-card-title">{title}</h3>
          <p className="create-workflow-action-card-description">
            {description}
          </p>
        </div>
        <div className="create-workflow-action-card-content pt-0">
          <Button 
            className="create-workflow-action-button" 
            size="lg"
            onClick={(e) => {
              e.stopPropagation();
              onClick();
            }}
          >
            {buttonText}
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </div>
    </button>
  );
};

const CreateWorkflowModal: React.FC<CreateWorkflowModalProps> = ({
  isOpen,
  onClose,
}) => {
  const navigate = useNavigate();

  const handleCreateFromExisting = () => {
    onClose();
    navigate("/workflow-config/select?intent=create-workflow");
  };

  const handleCreateFromScratch = () => {
    onClose();
    navigate("/workflow-builder/new?mode=blank");
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent 
        className="create-workflow-modal-content sm:max-w-4xl max-w-[95vw] p-0 overflow-hidden"
        onOpenAutoFocus={(e) => {
          // Focus will be set to the first action card
          e.preventDefault();
        }}
      >
        <DialogHeader className="create-workflow-modal-header">
          <DialogTitle className="create-workflow-modal-title">
            Start a new workflow
          </DialogTitle>
          <DialogDescription className="create-workflow-modal-description">
            Choose how you want to start creating your workflow.
          </DialogDescription>
        </DialogHeader>

        <div className="create-workflow-modal-body">
          <div className="create-workflow-modal-grid">
            <ActionCard
              icon={<FileText className="w-8 h-8 text-primary" />}
              title="Create from Existing Configuration"
              description="Start from a saved workflow configuration. You'll select a configuration next."
              buttonText="Use Existing Configuration"
              onClick={handleCreateFromExisting}
            />
            
            <ActionCard
              icon={<Workflow className="w-8 h-8 text-primary" />}
              title="Create from Scratch"
              description="Open the builder with an empty configuration. Build your workflow from the ground up."
              buttonText="Start from Scratch"
              onClick={handleCreateFromScratch}
            />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CreateWorkflowModal;