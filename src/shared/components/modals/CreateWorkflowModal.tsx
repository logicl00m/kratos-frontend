import React from "react";
import { useNavigate } from "react-router-dom";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, Workflow, ArrowRight } from "lucide-react";

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
      <Card className="cursor-pointer transition-all duration-200 hover:shadow-lg hover:scale-105 border-2 hover:border-primary/20 group w-full h-full">
        <CardHeader className="text-center pb-4">
          <div className="mx-auto mb-4 w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
            {icon}
          </div>
          <h3 className="text-xl font-semibold text-foreground">{title}</h3>
          <p className="text-sm text-muted-foreground leading-relaxed">
            {description}
          </p>
        </CardHeader>
        <CardContent className="pt-0">
          <Button 
            className="w-full group-hover:bg-primary/90" 
            size="lg"
            onClick={(e) => {
              e.stopPropagation();
              onClick();
            }}
          >
            {buttonText}
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </CardContent>
      </Card>
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
        className="sm:max-w-4xl max-w-[95vw] p-0 overflow-hidden"
        onOpenAutoFocus={(e) => {
          // Focus will be set to the first action card
          e.preventDefault();
        }}
      >
        <DialogHeader className="p-6 pb-4 text-center">
          <DialogTitle className="text-2xl font-bold">
            Start a new workflow
          </DialogTitle>
          <DialogDescription className="text-base mt-2">
            Choose how you want to start creating your workflow.
          </DialogDescription>
        </DialogHeader>

        <div className="px-6 pb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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