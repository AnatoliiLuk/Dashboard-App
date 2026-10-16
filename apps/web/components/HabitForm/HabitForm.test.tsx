import { describe, expect, it, jest } from '@jest/globals';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { Habit } from '@repo/types';

import { renderWithProviders } from '../../test/render';
import { HabitForm } from './HabitForm';

function existingHabit(): Habit {
  return {
    id: 'habit-1',
    ownerId: 'user-1',
    name: 'Read',
    createdOn: '2026-10-06',
    color: 'sky',
  };
}

describe('HabitForm', () => {
  it('adds a habit and keeps the chosen color', async () => {
    const user = userEvent.setup();
    const onAdd = jest.fn();

    renderWithProviders(<HabitForm onAdd={onAdd} />);

    await user.type(screen.getByRole('textbox', { name: 'Habit' }), 'Walk');
    await user.click(screen.getByRole('combobox', { name: 'Color' }));
    await user.click(screen.getByRole('option', { name: 'Green' }));
    await user.click(screen.getByRole('button', { name: 'Add' }));

    expect(onAdd).toHaveBeenCalledWith('Walk', 'green');
    expect(screen.getByRole('textbox', { name: 'Habit' })).toHaveValue('');
    expect(screen.getByRole('combobox', { name: 'Color' })).toHaveTextContent(
      'Green',
    );
  });

  it('saves changes to the habit already in the form', async () => {
    const user = userEvent.setup();
    const onUpdate = jest.fn(async () => undefined);
    const onAdd = jest.fn();

    renderWithProviders(
      <HabitForm
        editing={existingHabit()}
        onAdd={onAdd}
        onUpdate={onUpdate}
        onCancel={jest.fn()}
      />,
    );

    const name = screen.getByRole('textbox', { name: 'Habit' });
    expect(screen.getByText('Editing Read')).toBeInTheDocument();
    expect(name).toHaveValue('Read');
    expect(screen.getByRole('combobox', { name: 'Color' })).toHaveTextContent(
      'Sky',
    );

    await user.clear(name);
    await user.type(name, 'Walk');
    await user.click(screen.getByRole('combobox', { name: 'Color' }));
    await user.click(screen.getByRole('option', { name: 'Green' }));
    await user.click(screen.getByRole('button', { name: 'Save' }));

    expect(onAdd).not.toHaveBeenCalled();
    expect(onUpdate).toHaveBeenCalledWith('habit-1', {
      name: 'Walk',
      color: 'green',
    });
  });

  it('leaves the habit unchanged when the name is blank', async () => {
    const user = userEvent.setup();
    const onUpdate = jest.fn();

    renderWithProviders(
      <HabitForm
        editing={existingHabit()}
        onAdd={jest.fn()}
        onUpdate={onUpdate}
        onCancel={jest.fn()}
      />,
    );

    await user.clear(screen.getByRole('textbox', { name: 'Habit' }));
    await user.click(screen.getByRole('button', { name: 'Save' }));

    expect(onUpdate).not.toHaveBeenCalled();
    expect(screen.getByText('Editing Read')).toBeInTheDocument();
  });

  it('leaves the habit unchanged when editing is cancelled', async () => {
    const user = userEvent.setup();
    const onCancel = jest.fn();
    const onUpdate = jest.fn();

    renderWithProviders(
      <HabitForm
        editing={existingHabit()}
        onAdd={jest.fn()}
        onUpdate={onUpdate}
        onCancel={onCancel}
      />,
    );

    await user.click(screen.getByRole('button', { name: 'Cancel' }));

    expect(onCancel).toHaveBeenCalledTimes(1);
    expect(onUpdate).not.toHaveBeenCalled();
  });
});
