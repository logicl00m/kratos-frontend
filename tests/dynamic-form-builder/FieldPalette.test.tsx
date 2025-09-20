import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import FieldPalette from '@features/dynamic-form-builder/components/FieldPalette';

describe('FieldPalette', () => {
  it('renders all available field types', () => {
    render(<FieldPalette onFieldDragStart={vi.fn()} />);

    const types = [
      'Text',
      'Number',
      'Textarea',
      'File',
      'Select',
      'Radio',
      'Checkbox',
      'Date',
      'Section',
      'Divider',
    ];

    types.forEach((label) => {
      expect(screen.getByText(label)).toBeInTheDocument();
    });
  });

  it('calls onFieldDragStart with the dragged field type', () => {
    const handleDragStart = vi.fn();
    render(<FieldPalette onFieldDragStart={handleDragStart} />);

    const textItem = screen.getByText('Text');
    fireEvent.dragStart(textItem);

    expect(handleDragStart).toHaveBeenCalledWith('text');
  });
});
