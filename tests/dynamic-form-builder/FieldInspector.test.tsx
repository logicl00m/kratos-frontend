import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import FieldInspector from '@features/dynamic-form-builder/components/FieldInspector';
import type { Field } from '@features/dynamic-form-builder';

describe('FieldInspector', () => {
  const field: Field = {
    id: 'borrower_legal_name',
    name: 'Legal Name',
    type: 'text',
    status: 'default',
    data: '{{ data.borrower.legalName }}',
    fieldActions: ['save', 'validate'],
    validation: {
      required: true,
    },
  };

  it('renders placeholder when no field is selected', () => {
    render(<FieldInspector selectedField={null} onUpdateField={() => {}} onPreview={() => {}} />);

    expect(
      screen.getByText('Select a field on the canvas to configure its settings.')
    ).toBeInTheDocument();
  });

  it('calls onUpdateField when general properties change', async () => {
    const onUpdateField = vi.fn();
    const user = userEvent.setup();

    render(
      <FieldInspector selectedField={field} onUpdateField={onUpdateField} onPreview={() => {}} />
    );

    const labelInput = screen.getByLabelText('Label');
    await user.type(labelInput, 'X');

    expect(onUpdateField).toHaveBeenCalledWith({ name: 'Legal NameX' });
  });

  it('toggles field actions through the switch component', async () => {
    const onUpdateField = vi.fn();
    const user = userEvent.setup();

    render(
      <FieldInspector selectedField={field} onUpdateField={onUpdateField} onPreview={() => {}} />
    );

    const toggleSave = screen.getByRole('switch', { name: 'Toggle save' });
    await user.click(toggleSave);

    expect(onUpdateField).toHaveBeenCalledWith({
      fieldActions: ['validate'],
    });
  });

  it('adds options for selectable fields', async () => {
    const onUpdateField = vi.fn();
    const user = userEvent.setup();
    const selectField: Field = {
      ...field,
      type: 'select',
      options: [],
    };

    render(
      <FieldInspector selectedField={selectField} onUpdateField={onUpdateField} onPreview={() => {}} />
    );

    await user.click(screen.getByRole('button', { name: 'Add Option' }));

    expect(onUpdateField).toHaveBeenCalledWith(
      expect.objectContaining({ options: expect.any(Array) })
    );
  });

  it('calls onPreview when preview button clicked', async () => {
    const onUpdateField = vi.fn();
    const onPreview = vi.fn();
    const user = userEvent.setup();

    render(
      <FieldInspector selectedField={field} onUpdateField={onUpdateField} onPreview={onPreview} />
    );

    await user.click(screen.getByRole('button', { name: 'Preview' }));

    expect(onPreview).toHaveBeenCalledTimes(1);
  });
});

