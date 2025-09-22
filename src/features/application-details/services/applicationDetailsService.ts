// src/features/application-details/services/applicationDetailsService.ts
import { workflowInstanceApi } from "@lib/api/endpoints/workflow";
import type { ApplicationInstance } from "@lib/api/types";

export const applicationDetailsService = {
  /**
   * Fetch application details by ID
   */
  async getApplicationDetails(id: string): Promise<ApplicationInstance> {
    try {
      const response = await workflowInstanceApi.get(id);
      
      if (response.success && response.data) {
        return response.data;
      }
      
      throw new Error(response.message || `Failed to fetch application details for ID: ${id}`);
    } catch (error) {
      console.error("Error fetching application details:", error);
      throw error;
    }
  },

  /**
   * Fetch application history/audit trail
   */
  async getApplicationHistory(id: string) {
    try {
      const response = await workflowInstanceApi.getHistory(id);
      
      if (response.success && response.data) {
        return response.data;
      }
      
      throw new Error(response.message || `Failed to fetch application history for ID: ${id}`);
    } catch (error) {
      console.error("Error fetching application history:", error);
      throw error;
    }
  },

  /**
   * Fetch application documents
   */
  async getApplicationDocuments(id: string) {
    try {
      const response = await workflowInstanceApi.getDocuments(id);
      
      if (response.success && response.data) {
        return response.data;
      }
      
      throw new Error(response.message || `Failed to fetch application documents for ID: ${id}`);
    } catch (error) {
      console.error("Error fetching application documents:", error);
      throw error;
    }
  },

  /**
   * Add a comment to an application
   */
  async addComment(id: string, comment: string) {
    try {
      const response = await workflowInstanceApi.addComment(id, comment);
      
      if (response.success) {
        return response.data;
      }
      
      throw new Error(response.message || `Failed to add comment to application ID: ${id}`);
    } catch (error) {
      console.error("Error adding comment:", error);
      throw error;
    }
  },

  /**
   * Upload a document to an application
   */
  async uploadDocument(id: string, file: File, documentType?: string) {
    try {
      const response = await workflowInstanceApi.uploadDocument(id, file, documentType);
      
      if (response.success && response.data) {
        return response.data;
      }
      
      throw new Error(response.message || `Failed to upload document to application ID: ${id}`);
    } catch (error) {
      console.error("Error uploading document:", error);
      throw error;
    }
  }
};