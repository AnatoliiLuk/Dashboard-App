import { describe, expect, it, jest } from '@jest/globals';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import type { HabitToday } from '@/lib/habits/log';

import { renderWithProviders } from '../../test/render';
import { HabitLogger } from './HabitLogger';

function habitItem(): HabitToday {
  return {
    habit: {
      id: 'habit-1',
      ownerId: 'user-1',
      name: 'Read',
      createdOn: '2026-10-06',
      color: 'sky',
    },
    doneToday: false,
    currentStreak: 0,
    days: [{ date: '2026-10-06', done: false }],
  };
}

describe('HabitLogger', () => {
  it('fills the main form from the habit being edited', async () => {
    const user = userEvent.setup();
    const onUpdate = jest.fn(async () => undefined);

    renderWithProviders(
      <HabitLogger
        habits={[habitItem()]}
        onAdd={jest.fn()}
        onUpdate={onUpdate}
        onToggle={jest.fn()}
        onDelete={jest.fn()}
      />,
    );

    expect(screen.getByRole('button', { name: 'Add' })).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Edit' }));

    const name = screen.getByRole('textbox', { name: 'Habit' });
    expect(name).toHaveValue('Read');
    expect(screen.getByRole('button', { name: 'Edit' })).toHaveAttribute(
      'aria-pressed',
      'true',
    );

    await user.clear(name);
    await user.type(name, 'Walk');
    await user.click(screen.getByRole('button', { name: 'Save' }));

    expect(onUpdate).toHaveBeenCalledWith('habit-1', {
      name: 'Walk',
      color: 'sky',
    });
    expect(screen.getByRole('button', { name: 'Add' })).toBeInTheDocument();
    expect(screen.getByRole('textbox', { name: 'Habit' })).toHaveValue('');
  });
});
