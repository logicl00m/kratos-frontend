import { http } from 'msw';

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
  http.get('/api/v1/client/private/dashboard/stats', () => {
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

  http.get('/api/v1/client/private/dashboard/applications', () => {
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
  })
];

export default handlers;
