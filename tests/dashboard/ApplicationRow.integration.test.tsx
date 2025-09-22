import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import ApplicationRow from '@features/dashboard/components/ApplicationRow';
import type { LoanApplication } from '@features/dashboard/types/dashboard.types';

describe('ApplicationRow', () => {
  const mockApplication: LoanApplication = {
    id: 'LN-2025-001',
    applicant: 'ABC Textiles Ltd.',
    product: 'Business Loan',
    amount: 50000000,
    stage: 'RMReview',
    assignee: 'Fahim Ahmed',
    initiatedBy: 'Sadia Rahman',
    sla: '5 days',
    slaStatus: 'ontime',
    lastUpdate: '2025-09-21T09:22:31+06:00',
    flags: []
  };

  const mockProps = {
    app: mockApplication,
    selected: false,
    onSelect: vi.fn(),
    onClick: vi.fn(),
    getStageColor: vi.fn().mockReturnValue('bg-blue-100'),
    getStatusIcon: vi.fn().mockReturnValue(null)
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders application data correctly', () => {
    render(<ApplicationRow {...mockProps} />);

    // Check that all application data is rendered
    expect(screen.getByText(mockApplication.id)).toBeInTheDocument();
    expect(screen.getByText(mockApplication.applicant)).toBeInTheDocument();
    expect(screen.getByText(`$${mockApplication.amount.toLocaleString()}`)).toBeInTheDocument();
    expect(screen.getByText(mockApplication.stage)).toBeInTheDocument();
    expect(screen.getByText(mockApplication.assignee)).toBeInTheDocument();
    expect(screen.getByText(mockApplication.initiatedBy)).toBeInTheDocument();
    expect(screen.getByText(mockApplication.sla)).toBeInTheDocument();
    expect(screen.getByText(mockApplication.lastUpdate)).toBeInTheDocument();
  });

  it('calls onSelect when checkbox is clicked', () => {
    render(<ApplicationRow {...mockProps} />);

    const checkbox = screen.getByRole('checkbox');
    fireEvent.click(checkbox);

    expect(mockProps.onSelect).toHaveBeenCalledWith(mockApplication.id);
    expect(mockProps.onClick).not.toHaveBeenCalled();
  });

  it('calls onClick when View button is clicked', () => {
    render(<ApplicationRow {...mockProps} />);

    const viewButton = screen.getByText('View');
    fireEvent.click(viewButton);

    expect(mockProps.onClick).toHaveBeenCalledWith(mockApplication);
    expect(mockProps.onSelect).not.toHaveBeenCalled();
  });

  it('applies correct stage color class', () => {
    render(<ApplicationRow {...mockProps} />);

    const stageBadge = screen.getByText(mockApplication.stage);
    expect(stageBadge).toHaveClass('bg-blue-100');
    expect(mockProps.getStageColor).toHaveBeenCalledWith(mockApplication.stage);
  });

  it('shows status icon when provided', () => {
    const propsWithIcon = {
      ...mockProps,
      getStatusIcon: vi.fn().mockReturnValue(<span data-testid="status-icon">!</span>)
    };

    render(<ApplicationRow {...propsWithIcon} />);

    expect(screen.getByTestId('status-icon')).toBeInTheDocument();
    expect(propsWithIcon.getStatusIcon).toHaveBeenCalledWith(mockApplication.slaStatus);
  });

  it('handles selection state correctly', () => {
    const propsSelected = {
      ...mockProps,
      selected: true
    };

    render(<ApplicationRow {...propsSelected} />);

    const checkbox = screen.getByRole('checkbox');
    expect(checkbox).toBeChecked();
  });
});