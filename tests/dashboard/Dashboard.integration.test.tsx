import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Dashboard from '@features/dashboard/components/Dashboard';
import { mockWorkflowData } from '@features/dashboard/data/mockWorkflowData';

// Mock the useApiWithFallback hooks
vi.mock('@/lib/hooks/useApiWithFallback', () => ({
  useDashboardApplications: () => ({
    data: {
      data: mockWorkflowData.map(wf => ({
        id: wf.workflow.id,
        workflowId: wf.workflow.id,
        currentState: wf.workflow.currentState,
        status: wf.workflow.currentState === 'Completed' ? 'completed' : 'pending',
        assignee: wf.workflow.states[wf.workflow.currentState]?.assignees?.[0]?.employeeName || 'Unassigned',
        data: wf.workflow.forms,
        history: [],
        metadata: {
          createdAt: new Date().toISOString(),
          updatedAt: wf.workflow.currentStateEnteredAt,
          slaStatus: 'on-time',
          priority: 'medium'
        }
      })),
      pagination: {
        page: 1,
        limit: 50,
        total: mockWorkflowData.length,
        totalPages: 1
      }
    },
    loading: false,
    isUsingFallback: true,
    error: null
  }),
  useDashboardStats: () => ({
    data: {
      totalApplications: mockWorkflowData.length,
      pendingApplications: mockWorkflowData.filter(w => w.workflow.currentState !== 'Completed').length,
      approvedApplications: mockWorkflowData.filter(w => w.workflow.currentState === 'Completed').length,
      rejectedApplications: 0,
      slaMetrics: {
        onTime: Math.floor(mockWorkflowData.length * 0.6),
        due: Math.floor(mockWorkflowData.length * 0.2),
        overdue: Math.floor(mockWorkflowData.length * 0.1),
        completed: Math.floor(mockWorkflowData.length * 0.1)
      }
    },
    loading: false,
    isUsingFallback: true,
    error: null
  }),
  useWorkflowInstance: vi.fn().mockReturnValue({
    data: null,
    loading: false,
    isUsingFallback: true,
    error: null
  })
}));

describe('Dashboard Integration', () => {
  const renderDashboard = (props = {}) => {
    const defaultProps = {
      currentUserName: "Fahim Ahmed"
    };
    
    return render(
      <BrowserRouter>
        <Dashboard {...defaultProps} {...props} />
      </BrowserRouter>
    );
  };

  it('renders dashboard with applications', async () => {
    renderDashboard();

    // Check that applications are rendered
    expect(screen.getByText(mockWorkflowData[0].workflow.id)).toBeInTheDocument();
    
    // Check that applicant names are rendered
    const firstApplicantName = mockWorkflowData[0].workflow.forms.coreDetails.fields.find(
      f => f.id === 'applicantName'
    )?.data;
    expect(screen.getByText(firstApplicantName as string)).toBeInTheDocument();
  });

  it('filters applications by search term', async () => {
    renderDashboard();

    const searchInput = screen.getByPlaceholderText('Search applications...');
    const firstApplicantName = mockWorkflowData[0].workflow.forms.coreDetails.fields.find(
      f => f.id === 'applicantName'
    )?.data as string;
    
    // Initially all applications should be visible
    expect(screen.getByText(firstApplicantName)).toBeInTheDocument();

    // Filter by search term that matches second application
    fireEvent.change(searchInput, { target: { value: 'XYZ' } });
    
    // Wait for filtering to complete
    await waitFor(() => {
      const secondApplicantName = mockWorkflowData[1].workflow.forms.coreDetails.fields.find(
        f => f.id === 'applicantName'
      )?.data as string;
      expect(screen.queryByText(secondApplicantName)).toBeInTheDocument();
    });
  });

  it('calls onApplicationClick when View button is clicked', async () => {
    const mockOnApplicationClick = vi.fn();
    renderDashboard({ onApplicationClick: mockOnApplicationClick });

    // Find the View button for the first application
    const viewButtons = screen.getAllByText('View');
    fireEvent.click(viewButtons[0]);

    // Check that onApplicationClick was called
    await waitFor(() => {
      expect(mockOnApplicationClick).toHaveBeenCalledTimes(1);
    });
  });

  it('handles row selection correctly', async () => {
    renderDashboard();

    // Find the checkbox for the first application
    const checkboxes = screen.getAllByRole('checkbox');
    const firstCheckbox = checkboxes[1]; // First checkbox is select all, second is first row
    
    // Click the checkbox
    fireEvent.click(firstCheckbox);
    
    // Check that the checkbox is checked
    expect(firstCheckbox).toBeChecked();
    
    // Click again to uncheck
    fireEvent.click(firstCheckbox);
    
    // Check that the checkbox is unchecked
    expect(firstCheckbox).not.toBeChecked();
  });

  it('handles select all functionality', async () => {
    renderDashboard();

    // Find the select all checkbox
    const selectAllCheckbox = screen.getAllByRole('checkbox')[0];
    
    // Click the select all checkbox
    fireEvent.click(selectAllCheckbox);
    
    // Check that all row checkboxes are checked
    const rowCheckboxes = screen.getAllByRole('checkbox').slice(1); // Exclude select all
    rowCheckboxes.forEach(checkbox => {
      expect(checkbox).toBeChecked();
    });
    
    // Click again to uncheck all
    fireEvent.click(selectAllCheckbox);
    
    // Check that all row checkboxes are unchecked
    rowCheckboxes.forEach(checkbox => {
      expect(checkbox).not.toBeChecked();
    });
  });
  
  it('uses fallback data when API calls fail', () => {
    renderDashboard();
    
    // Check that fallback stats are displayed
    expect(screen.getByText(`${mockWorkflowData.length}`)).toBeInTheDocument();
    
    // Check that fallback applications are displayed
    const firstApplicationId = mockWorkflowData[0].workflow.id;
    expect(screen.getByText(firstApplicationId)).toBeInTheDocument();
  });
});