import React from "react";
import ReactDOM from "react-dom/client";
import { ReactFlowProvider } from "reactflow";
import { ThemeProvider } from "@/contexts/ThemeContext";
import App from "@/app/App";
import { BrowserRouter } from "react-router-dom";
import "./index.css";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <ThemeProvider>
      <BrowserRouter>
        <ReactFlowProvider>
          <App />
        </ReactFlowProvider>
      </BrowserRouter>
    </ThemeProvider>
  </React.StrictMode>
);
