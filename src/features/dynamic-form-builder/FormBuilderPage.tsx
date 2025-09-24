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
        if (nodeId && from === "/builder") {
          if (confirm("Form saved! Return to workflow builder?")) {
            navigate(from, {
              replace: true,
              state: { attachForm: form, nodeId },
            });
          }
        }
      }}
      onCancel={() => navigate(from, { replace: true })}
    />
  );
};

export default FormBuilderPage;
