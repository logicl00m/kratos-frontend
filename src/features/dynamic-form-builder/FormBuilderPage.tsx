import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { DynamicFormBuilder } from "@features/dynamic-form-builder";

type LocationState = {
  from?: string;
  nodeId?: string;
};

const FormBuilderPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const state = (location.state as LocationState) || {};
  const from = state.from || "/builder";
  const nodeId = state.nodeId;

  return (
    <DynamicFormBuilder
      onSave={(form) => {
        // Only navigate if coming from workflow builder with a nodeId
        if (nodeId && from === "/builder") {
          navigate(from, {
            replace: true,
            state: { attachForm: form, nodeId },
          });
        }
        // Otherwise stay on the current page
      }}
      onCancel={() => navigate(from, { replace: true })}
    />
  );
};

export default FormBuilderPage;
