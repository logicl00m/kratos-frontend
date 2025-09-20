import { render, screen, fireEvent, within } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import FieldList from '@features/dynamic-form-builder/components/FieldList';
import type { Field } from '@features/dynamic-form-builder';

describe('FieldList', () => {
  const fields: Field[] = [
    {
      id: 'borrower_legal_name',
      name: 'Legal Name',
      type: 'text',
      status: 'default',
      data: '{{ data.borrower.legalName }}',
      fieldActions: ['save', 'validate'],
    },
    {
      id: 'borrower_birthdate',
      name: 'Birthdate',
      type: 'date',
      status: 'default',
      data: '{{ data.borrower.birthdate }}',
      fieldActions: ['save'],
    },
  ];

  const setup = () => {
    const onFieldSelect = vi.fn();
    const onFieldReorderStart = vi.fn();
    const onDragOver = vi.fn();
    const onDrop = vi.fn();
    const onDeleteField = vi.fn();
    const onDuplicateField = vi.fn();

    render(
      <FieldList
        fields={fields}
        selectedField={fields[0]}
        onFieldSelect={onFieldSelect}
        onFieldReorderStart={onFieldReorderStart}
        onDragOver={onDragOver}
        onDrop={onDrop}
        onDeleteField={onDeleteField}
        onDuplicateField={onDuplicateField}
        dragOverIndex={null}
      />
    );

    return {
      onFieldSelect,
      onFieldReorderStart,
      onDrop,
      onDeleteField,
      onDuplicateField,
    };
  };

  it('renders provided fields and metadata', () => {
    setup();

    expect(screen.getByText('Legal Name')).toBeInTheDocument();
    expect(screen.getByText('Birthdate')).toBeInTheDocument();
    expect(screen.getByText('id: borrower_legal_name')).toBeInTheDocument();
    expect(screen.getByText('data: {{ data.borrower.birthdate }}')).toBeInTheDocument();
  });

  it('calls onFieldSelect when a field is clicked', () => {
    const { onFieldSelect } = setup();

    fireEvent.click(screen.getByText('Birthdate'));

    expect(onFieldSelect).toHaveBeenCalledWith(fields[1]);
  });

  it('calls drag handlers when dragging begins and drops', () => {
    const { onFieldReorderStart, onDrop } = setup();
    const firstItem = screen.getByText('Legal Name').closest('[draggable="true"]');
    const secondItem = screen.getByText('Birthdate').closest('[draggable="true"]');

    expect(firstItem).not.toBeNull();
    expect(secondItem).not.toBeNull();

    fireEvent.dragStart(firstItem!);
    expect(onFieldReorderStart).toHaveBeenCalledWith(0);

    fireEvent.drop(secondItem!);
    expect(onDrop).toHaveBeenCalled();
    expect(onDrop.mock.calls[0][1]).toBe(1);
  });

  it('invokes duplicate and delete callbacks from action buttons', () => {
    const { onDuplicateField, onDeleteField } = setup();
    const firstItem = screen.getByText('Legal Name').closest('[draggable="true"]');
    expect(firstItem).not.toBeNull();

    const utils = within(firstItem!);
    fireEvent.click(utils.getByRole('button', { name: 'Duplicate Legal Name' }));
    expect(onDuplicateField).toHaveBeenCalledWith(0);

    fireEvent.click(utils.getByRole('button', { name: 'Delete Legal Name' }));
    expect(onDeleteField).toHaveBeenCalledWith(0);
  });
});
