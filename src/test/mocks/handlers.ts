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
  })
];

export default handlers;
