import { http } from 'msw';

const API_BASE_URL = 'https://kratos-api.local.fintech23.xyz';

export const handlers = [
  http.get('/api/applications', () => {
    return Response.json([
      { id: '1', applicant: 'Sarah Johnson', amount: 30000 },
      { id: '2', applicant: 'Michael Chen', amount: 15000 },
      { id: '3', applicant: 'Aaron Park', amount: 22000 }
    ]);
  }),

  http.post('/api/applications/:id/comments', async ({ request }) => {
    const body = await request.json();
    return Response.json({ success: true, comment: body });
  }),

  // Dashboard API handlers used by the app during tests
  http.post(`${API_BASE_URL}/api/v1/client/private/dashboard/stats`, () => {
    return Response.json({
      success: true,
      data: {
        totalApplications: 2,
        pendingApplications: 2,
        approvedApplications: 0,
        rejectedApplications: 0,
        slaMetrics: { onTime: 2, due: 0, overdue: 0, completed: 0 }
      }
    });
  }),

  http.post(`${API_BASE_URL}/api/v1/client/private/dashboard/applications`, () => {
    return Response.json({
      success: true,
      data: [
        {
          id: 'app-1',
          workflowId: 'wf-1',
          currentState: 'Review',
          status: 'pending',
          assignee: 'Sarah Johnson',
          data: { firstName: 'Sarah', lastName: 'Johnson', productType: 'Personal Loan', loanAmount: 50000 },
          history: [],
          metadata: { createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), slaStatus: 'on-time', priority: 'medium' }
        },
        {
          id: 'app-2',
          workflowId: 'wf-2',
          currentState: 'Approval',
          status: 'pending',
          assignee: 'Michael Chen',
          data: { firstName: 'Michael', lastName: 'Chen', productType: 'Mortgage', loanAmount: 200000 },
          history: [],
          metadata: { createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), slaStatus: 'on-time', priority: 'low' }
        }
      ],
      pagination: { page: 1, limit: 50, total: 2, totalPages: 1 }
    });
  }),

  http.get('/api/v1/client/private/dashboard/search', () => {
    return Response.json({ success: true, data: [] });
  }),

  // Workflow initiation handlers
  http.get('/api/workflows/templates', () => {
    return Response.json({
      success: true,
      data: [
        {
          id: "loan-approval",
          name: "Loan Approval Process",
          description: "Standard loan application and approval workflow for credit processing",
          category: "Credit",
          estimatedTime: "3-5 days",
          lastUsed: "2025-09-20T10:30:00+06:00",
          usageCount: 145,
          status: 'active',
          requiredFields: ["borrower_name", "loan_amount", "loan_purpose"]
        },
        {
          id: "account-opening",
          name: "Account Opening",
          description: "New customer account opening with KYC verification process",
          category: "Onboarding",
          estimatedTime: "1-2 days",
          lastUsed: "2025-09-21T14:15:00+06:00",
          usageCount: 89,
          status: 'active',
          requiredFields: ["customer_name", "id_document"]
        }
      ]
    });
  }),

  http.post('/api/workflows/initiate', async ({ request }) => {
    const body = await request.json() as { workflowTemplateId: string };
    const workflowId = `WF-${new Date().getFullYear()}-${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}`;

    return Response.json({
      success: true,
      workflowId: workflowId,
      message: `Workflow initiated successfully`,
      redirectUrl: `/running/${workflowId}`
    });
  })
];

export default handlers;
