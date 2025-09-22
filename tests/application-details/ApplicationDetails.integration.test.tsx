import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import ApplicationDetails from '@features/application-details/components/ApplicationDetails';
import { mockWorkflowData } from '@features/dashboard/data/mockWorkflowData';

describe('ApplicationDetails', () => {
  const renderApplicationDetails = (props = {}) => {
    return render(
      <BrowserRouter>
        <ApplicationDetails 
          onBack={vi.fn()}
          {...props}
        />
      </BrowserRouter>
    );
  };

  it('renders with valid workflow data', () => {
    const workflowData = mockWorkflowData[0];
    
    renderApplicationDetails({ workflowData });

    // Check that applicant name is rendered
    const applicantName = workflowData.workflow.forms.coreDetails.fields.find(f => f.id === 'applicantLegalName')?.data as string;
    expect(screen.getByText(applicantName)).toBeInTheDocument();

    // Check that amount is rendered
    const amount = workflowData.workflow.forms.coreDetails.fields.find(f => f.id === 'requestedAmount')?.data as number;
    expect(screen.getByText(`$${amount.toLocaleString()}`)).toBeInTheDocument();

    // Check that current state is rendered
    expect(screen.getByText(workflowData.workflow.currentState)).toBeInTheDocument();
  });

  it('renders with fallback data when no workflow data is provided', () => {
    renderApplicationDetails();

    // Should show no workflow data message
    expect(screen.getByText('No workflow data available')).toBeInTheDocument();
  });

  it('extracts applicant name from various field IDs', () => {
    // Create a mock workflow with different field IDs for applicant name
    const workflowData = {
      workflow: {
        ...mockWorkflowData[0].workflow,
        forms: {
          coreDetails: {
            fields: [
              {
                id: 'firstName',
                name: 'First Name',
                type: 'text',
                data: 'John'
              },
              {
                id: 'lastName',
                name: 'Last Name',
                type: 'text',
                data: 'Doe'
              },
              {
                id: 'loanAmount',
                name: 'Loan Amount',
                type: 'number',
                data: 50000
              }
            ]
          }
        }
      }
    };

    renderApplicationDetails({ workflowData });

    // Should combine firstName and lastName
    expect(screen.getByText('John Doe')).toBeInTheDocument();
  });

  it('extracts amount from various field IDs', () => {
    // Create a mock workflow with different field IDs for amount
    const workflowData = {
      workflow: {
        ...mockWorkflowData[0].workflow,
        forms: {
          coreDetails: {
            fields: [
              {
                id: 'applicantLegalName',
                name: 'Applicant Legal Name',
                type: 'text',
                data: 'John Doe'
              },
              {
                id: 'principalAmount',
                name: 'Principal Amount',
                type: 'number',
                data: 75000
              }
            ]
          }
        }
      }
    };

    renderApplicationDetails({ workflowData });

    // Should find the principalAmount field
    expect(screen.getByText('$75,000')).toBeInTheDocument();
  });

  it('shows correct workflow stages based on current state', () => {
    const workflowData = {
      ...mockWorkflowData[0],
      workflow: {
        ...mockWorkflowData[0].workflow,
        currentState: 'CMReview'
      }
    };

    renderApplicationDetails({ workflowData });

    // Should show completed stages
    expect(screen.getByText('Application')).toBeInTheDocument();
    expect(screen.getByText('Verification')).toBeInTheDocument();
    
    // Should show current stage
    expect(screen.getByText('Underwriting')).toBeInTheDocument();
    
    // Should show pending stages
    expect(screen.getByText('Decision')).toBeInTheDocument();
    expect(screen.getByText('Disbursement')).toBeInTheDocument();
  });
});