import { useState, useEffect } from 'react';
import { ApiError, dashboardApi, workflowInstanceApi, formApi, templateApi, runningWorkflowApi } from '@/lib/api';
import type { 
  DashboardStats, 
  ApplicationInstance, 
  FilterOptions, 
  PaginatedRequest,
  FormDefinition,
  WorkflowTemplate,
  User
} from '@/lib/api';

// Fallback imports
import { workflowTemplates } from '@features/workflow-templates/data/workflowTemplates';
import { runningWorkflowsData, allWorkflows } from '@features/running-workflows/data/runningWorkflows.data';
import { mockPeople } from '@features/workflow-config-edit/data/mockPeople';
import type { WorkflowData } from '@features/dashboard/types/dashboard.types';

/**
 * Hook for API calls with automatic fallback to mock data
 */
export const useApiWithFallback = <T>(
  apiCall: () => Promise<T>,
  fallbackData: T,
  dependencies: unknown[] = []
): {
  data: T;
  loading: boolean;
  error: ApiError | null;
  isUsingFallback: boolean;
  retry: () => void;
} => {
  const [data, setData] = useState<T>(fallbackData);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<ApiError | null>(null);
  const [isUsingFallback, setIsUsingFallback] = useState(false);

  const executeApiCall = async () => {
    try {
      setLoading(true);
      setError(null);
      setIsUsingFallback(false);
      
      const result = await apiCall();
      setData(result);
      
      console.log('✅ API call successful, using real data');
    } catch (err) {
      const apiError = err as ApiError;
      setError(apiError);
      setData(fallbackData);
      setIsUsingFallback(true);
      
      console.warn('⚠️ API call failed, falling back to mock data:', apiError.message);
      console.log('📊 Using fallback data:', fallbackData);
    } finally {
      setLoading(false);
    }
  };

  const retry = () => {
    executeApiCall();
  };

  useEffect(() => {
    executeApiCall();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, dependencies);

  return { data, loading, error, isUsingFallback, retry };
};

/**
 * Hook for dashboard statistics with fallback
 */
export const useDashboardStats = (filters?: FilterOptions) => {
  // Use running-workflows as canonical mock source
  const workflowList = allWorkflows as unknown as WorkflowData[];
  const fallbackStats: DashboardStats = {
    totalApplications: workflowList.length,
    pendingApplications: workflowList.filter(w => w.workflow.currentState !== 'Completed').length,
    approvedApplications: workflowList.filter(w => w.workflow.currentState === 'Completed').length,
    rejectedApplications: 0,
    slaMetrics: {
      onTime: Math.floor(workflowList.length * 0.6),
      due: Math.floor(workflowList.length * 0.2),
      overdue: Math.floor(workflowList.length * 0.1),
      completed: Math.floor(workflowList.length * 0.1),
    }
  };

  return useApiWithFallback(
    () => dashboardApi.getStats(filters).then(response => response.data!),
    fallbackStats,
    [filters]
  );
};

/**
 * Hook for dashboard applications with fallback
 */
export const useDashboardApplications = (params?: PaginatedRequest & FilterOptions) => {
  // Convert running-workflows mock data to ApplicationInstance format
  const workflowList = allWorkflows as unknown as WorkflowData[];
  const fallbackApplications: ApplicationInstance[] = workflowList.map((mockData: WorkflowData) => {
    const status: ApplicationInstance['status'] = mockData.workflow.currentState === 'Completed' ? 'completed' : 'pending';
    const slaStatus: ApplicationInstance['metadata']['slaStatus'] = status === 'completed' ? 'completed' : 'on-time';
    const createdAt = new Date(new Date(mockData.workflow.currentStateEnteredAt).getTime() - 48 * 3600 * 1000).toISOString();
    return {
      id: mockData.workflow.id,
      workflowId: mockData.workflow.id,
      currentState: mockData.workflow.currentState,
      status,
      assignee: getCurrentAssignee(mockData.workflow),
      data: extractFormData(mockData.workflow.forms),
      history: [],
      metadata: {
        createdAt,
        updatedAt: mockData.workflow.currentStateEnteredAt,
        slaStatus,
        priority: 'medium'
      }
    };
  });

  const fallbackResponse = {
    data: fallbackApplications,
    pagination: {
      page: 1,
      limit: 50,
      total: fallbackApplications.length,
      totalPages: 1
    }
  };

  return useApiWithFallback(
    () => dashboardApi.getApplications(params).then(response => response.data!),
    fallbackResponse,
    [params]
  );
};

/**
 * Hook for workflow templates with fallback
 */
export const useWorkflowTemplates = () => {
  const fallbackTemplates: WorkflowTemplate[] = workflowTemplates.map(template => ({
    id: template.id,
    name: template.name,
    description: template.description,
    category: template.category as 'New Application' | 'Review' | 'Assessment' | 'Custom',
    workflow: {
      id: template.id,
      name: template.name,
      description: template.description,
      version: '1.0.0',
      nodes: [],
      edges: [],
      metadata: {
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        createdBy: 'system'
      }
    },
    tags: []
  }));

  return useApiWithFallback(
    () => templateApi.list().then(response => response.data!),
    fallbackTemplates
  );
};

/**
 * Hook for running workflows with fallback
 */
export const useRunningWorkflows = (filters?: { status?: 'running' | 'paused' | 'completed' | 'failed'; workflowId?: string; assignee?: string }) => {
  // Use the original workflow data directly, not the transformed instances
  const fallbackWorkflowData: WorkflowData[] = runningWorkflowsData.instances.map(instance => {
    // Find the original workflow data that corresponds to this instance
    const originalWorkflow = allWorkflows.find(w => w.workflow.id === instance.id);
    if (originalWorkflow) {
      return originalWorkflow;
    }
    
    // If not found, create a minimal WorkflowData structure from the instance
    return {
      workflow: {
        id: instance.id,
        version: 1,
        initialState: 'start',
        currentState: instance.currentState || 'start',
        currentStateEnteredAt: instance.updatedAt,
        forms: {},
        states: {
          [instance.currentState || 'start']: {
            assignees: instance.currentAssignee ? [{
              subjectId: instance.currentAssignee.id,
              employeeName: instance.currentAssignee.name,
              role: instance.currentAssignee.role || 'User',
              email: instance.currentAssignee.email || `${instance.currentAssignee.name.toLowerCase().replace(' ', '.')}@company.com`,
              primary: true,
              since: instance.updatedAt
            }] : [],
            forms: [],
            actions: {},
            history: []
          }
        }
      }
    } as WorkflowData;
  });

  const apiResult = useApiWithFallback(
    () => runningWorkflowApi.list(filters).then(response => {
      // Transform API data to WorkflowData format
      const apiData = Array.isArray(response.data) ? response.data : [];
      const transformedData = apiData.map(rw => ({
        workflow: {
          id: rw.id,
          version: 1,
          initialState: 'start',
          currentState: rw.currentNode,
          currentStateEnteredAt: rw.lastUpdated,
          forms: {},
          states: {
            [rw.currentNode]: {
              assignees: rw.assignee ? [{
                subjectId: rw.id,
                employeeName: rw.assignee,
                role: 'User',
                email: `${rw.assignee.toLowerCase().replace(' ', '.')}@company.com`,
                primary: true,
                since: rw.lastUpdated
              }] : [],
              forms: [],
              actions: {},
              history: []
            }
          }
        }
      } as WorkflowData));
      return transformedData;
    }),
    fallbackWorkflowData,
    [filters]
  );

  return apiResult;
};

/**
 * Hook for users/people with fallback
 */
export const useUsers = () => {
  const fallbackUsers: User[] = mockPeople.map(person => ({
    id: person.id,
    username: person.name.toLowerCase().replace(' ', '.'),
    email: `${person.name.toLowerCase().replace(' ', '.')}@company.com`,
    firstName: person.name.split(' ')[0],
    lastName: person.name.split(' ').slice(1).join(' '),
    roles: [person.type], // Using type as role since that's what's available
    permissions: [],
    department: 'Unknown', // Default department since not available in Person type
    avatar: undefined // Not available in Person type
  }));

  return useApiWithFallback(
    () => Promise.reject(new Error('User API not implemented yet')),
    fallbackUsers
  );
};

/**
 * Hook for forms with fallback
 */
export const useForms = (params?: PaginatedRequest) => {
  const fallbackForms: FormDefinition[] = [
    {
      id: 'core-details-form',
      name: 'Core Details Form',
      description: 'Basic application details',
      fields: [
        {
          id: 'applicantLegalName',
          type: 'text',
          label: 'Applicant Legal Name',
          required: true
        },
        {
          id: 'requestedAmount',
          type: 'number',
          label: 'Requested Amount',
          required: true
        }
      ]
    },
    {
      id: 'proposal-docs-form',
      name: 'Proposal Documents Form',
      description: 'Document upload form',
      fields: [
        {
          id: 'supportingDocuments',
          type: 'file',
          label: 'Supporting Documents'
        }
      ]
    }
  ];

  const fallbackResponse = {
    data: fallbackForms,
    pagination: {
      page: 1,
      limit: 50,
      total: fallbackForms.length,
      totalPages: 1
    }
  };

  return useApiWithFallback(
    () => formApi.list(params).then(response => response.data!),
    fallbackResponse,
    [params]
  );
};

/**
 * Hook for single workflow instance with fallback
 */
export const useWorkflowInstance = (instanceId: string) => {
  const mockData = (allWorkflows as unknown as WorkflowData[]).find(w => w.workflow.id === instanceId);
  
  const fallbackInstance: ApplicationInstance | null = mockData ? {
    id: mockData.workflow.id,
    workflowId: mockData.workflow.id,
    currentState: mockData.workflow.currentState,
    status: mockData.workflow.currentState === 'Completed' ? 'completed' : 'pending',
    assignee: getCurrentAssignee(mockData.workflow),
    data: extractFormData(mockData.workflow.forms),
    history: [],
    metadata: {
      createdAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: mockData.workflow.currentStateEnteredAt,
      slaStatus: (mockData.workflow.currentState === 'Completed' ? 'completed' : 'on-time'),
      priority: 'medium'
    }
  } : null;

  return useApiWithFallback(
    () => workflowInstanceApi.get(instanceId).then(response => response.data!),
    fallbackInstance,
    [instanceId]
  );
};

/**
 * Utility function to get current assignee from mock workflow
 */
function getCurrentAssignee(workflow: { states: Record<string, { assignees?: Array<{ employeeName: string }> }>; currentState: string }): string | undefined {
  const currentStateData = workflow.states[workflow.currentState];
  if (currentStateData?.assignees && currentStateData.assignees.length > 0) {
    return currentStateData.assignees[0].employeeName;
  }
  return undefined;
}

/**
 * Utility function to extract form data from mock workflow
 */
function extractFormData(forms: Record<string, { fields?: Array<{ id: string; data: unknown }> }>): Record<string, string | number | boolean | object> {
  const data: Record<string, string | number | boolean | object> = {};
  
  Object.keys(forms).forEach(formKey => {
    const form = forms[formKey];
    if (form.fields) {
      form.fields.forEach((field: { id: string; data: unknown }) => {
        const value = field.data;
        // Type guard to ensure we only store valid types
        if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean' || (typeof value === 'object' && value !== null)) {
          data[field.id] = value;

          // Alias legacy ids from running-workflows mock to normalized keys expected by Dashboard
          const idLower = field.id.toLowerCase();
          if (idLower === 'applicantlegalname' && typeof value === 'string') {
            data['applicantName'] = value;
          }
          if (
            (
              idLower === 'requestedamount' ||
              idLower === 'amount' ||
              idLower === 'principalamount' ||
              idLower === 'fundingamount' ||
              idLower === 'totalamountrequested' ||
              idLower === 'requestamount'
            )
          ) {
            if (typeof value === 'number') data['loanAmount'] = value;
            else if (typeof value === 'string') {
              const n = Number(value.replace(/[^0-9.]/g, ''));
              if (!Number.isNaN(n)) data['loanAmount'] = n;
            }
          }
          if (idLower === 'loanamount') {
            data['loanAmount'] = value as number;
          }
        }
      });
    }
  });
  
  return data;
}

/**
 * Hook for API mutations with fallback behavior
 */
export const useApiMutation = <TData, TVariables>(
  mutationFn: (variables: TVariables) => Promise<TData>,
  options?: {
    onSuccess?: (data: TData) => void;
    onError?: (error: ApiError) => void;
    fallbackFn?: (variables: TVariables) => TData;
  }
) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<ApiError | null>(null);
  const [isUsingFallback, setIsUsingFallback] = useState(false);

  const mutate = async (variables: TVariables) => {
    try {
      setLoading(true);
      setError(null);
      setIsUsingFallback(false);

      const result = await mutationFn(variables);
      options?.onSuccess?.(result);
      
      console.log('✅ API mutation successful');
      return result;
    } catch (err) {
      const apiError = err as ApiError;
      setError(apiError);
      
      if (options?.fallbackFn) {
        const fallbackResult = options.fallbackFn(variables);
        setIsUsingFallback(true);
        console.warn('⚠️ API mutation failed, using fallback:', apiError.message);
        return fallbackResult;
      } else {
        options?.onError?.(apiError);
        throw apiError;
      }
    } finally {
      setLoading(false);
    }
  };

  return { mutate, loading, error, isUsingFallback };
};