import { screen, within, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { act } from 'react';
import { describe, it, expect } from 'vitest';
import { DynamicFormBuilder } from '@features/dynamic-form-builder';
import { renderWithProviders } from '../test-utils';

describe('DynamicFormBuilder', () => {
  const renderBuilder = async () => {
    await act(async () => {
      renderWithProviders(<DynamicFormBuilder />);
    });
    return userEvent.setup();
  };

  it('renders default seed fields', async () => {
    await renderBuilder();

    expect(screen.getByText('Legal Name')).toBeInTheDocument();
    expect(screen.getByText('Birthdate')).toBeInTheDocument();
    expect(screen.getByText('Document Upload')).toBeInTheDocument();
  });

  it('adds a new field and selects it for editing', async () => {
    const user = await renderBuilder();

    await user.click(screen.getByRole('button', { name: 'Add Field' }));

    expect(screen.getByText('New Field')).toBeInTheDocument();
    expect(screen.getByLabelText('Label')).toHaveValue('New Field');
  });

  it('duplicates an existing field', async () => {
    const user = await renderBuilder();

    const legalNameItem = screen
      .getByText('Legal Name')
      .closest('[draggable="true"]');
    expect(legalNameItem).not.toBeNull();

    await user.click(
      within(legalNameItem!).getByRole('button', { name: 'Duplicate Legal Name' })
    );

    expect(screen.getByText('Legal Name (Copy)')).toBeInTheDocument();
  });

  it('deletes an existing field', async () => {
    const user = await renderBuilder();

    const documentItem = screen
      .getByText('Document Upload')
      .closest('[draggable="true"]');
    expect(documentItem).not.toBeNull();

    await user.click(
      within(documentItem!).getByRole('button', { name: 'Delete Document Upload' })
    );

    expect(screen.queryByText('Document Upload')).not.toBeInTheDocument();
  });

  it('updates field label via the inspector', async () => {
    const user = await renderBuilder();

    await user.click(screen.getByText('Legal Name'));
    const labelInput = screen.getByLabelText('Label');

    await user.type(labelInput, 'X');

    expect(screen.getByText('Legal NameX')).toBeInTheDocument();
  });

  it('opens and closes the preview overlay', async () => {
    const user = await renderBuilder();

    await user.click(screen.getByRole('button', { name: 'Preview' }));
    const dialog = screen.getByRole('dialog', { name: /form preview/i });
    expect(dialog).toBeInTheDocument();

    await user.click(within(dialog).getByRole('button', { name: 'Close' }));

    await waitFor(() =>
      expect(screen.queryByRole('dialog', { name: /form preview/i })).not.toBeInTheDocument()
    );
  });
});

