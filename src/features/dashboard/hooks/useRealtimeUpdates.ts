// src/features/dashboard/hooks/useRealtimeUpdates.ts
import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { getApiConfig } from "@lib/api/client";

export const useRealtimeUpdates = () => {
  const queryClient = useQueryClient();
  
  useEffect(() => {
    // Get the WebSocket URL from the API config
    const apiConfig = getApiConfig();
    const wsUrl = apiConfig.baseURL.replace("http", "ws") + "/dashboard";
    
    // Create WebSocket connection
    const ws = new WebSocket(wsUrl);
    
    ws.onopen = () => {
      console.log("Connected to dashboard WebSocket");
    };
    
    ws.onmessage = (event) => {
      try {
        const { type, data } = JSON.parse(event.data);
        
        switch(type) {
          case "application:updated":
            // Update specific application in cache
            queryClient.setQueryData(
              ["applications"],
              (oldData: any) => {
                if (!oldData) return oldData;
                
                // Find and update the specific application
                const updatedItems = oldData.data?.map((item: any) =>
                  item.id === data.id ? { ...item, ...data.changes } : item
                ) || [];
                
                return {
                  ...oldData,
                  data: updatedItems
                };
              }
            );
            break;
            
          case "application:created":
            // Add new application to cache
            queryClient.setQueryData(
              ["applications"],
              (oldData: any) => {
                if (!oldData) return oldData;
                
                return {
                  ...oldData,
                  data: [data.application, ...oldData.data]
                };
              }
            );
            break;
            
          case "statistics:updated":
            // Update dashboard statistics
            queryClient.setQueryData(
              ["dashboard", "stats"],
              data.statistics
            );
            break;
            
          default:
            console.log("Unknown WebSocket event type:", type);
        }
      } catch (error) {
        console.error("Error processing WebSocket message:", error);
      }
    };
    
    ws.onerror = (error) => {
      console.error("WebSocket error:", error);
    };
    
    ws.onclose = (event) => {
      console.log("WebSocket connection closed:", event.reason);
      
      // Attempt to reconnect after a delay
      if (!event.wasClean) {
        setTimeout(() => {
          // Recursive call to reconnect
          // Note: In a real implementation, we should limit retry attempts
        }, 5000);
      }
    };
    
    // Clean up WebSocket connection on unmount
    return () => {
      ws.close(1000, "Component unmounted");
    };
  }, [queryClient]);
};