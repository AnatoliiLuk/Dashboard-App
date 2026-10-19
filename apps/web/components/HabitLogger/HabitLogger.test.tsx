import { describe, expect, it, jest } from '@jest/globals';
import { screen, within } from '@testing-library/react';
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

    expect(
      screen.getByRole('button', { name: 'Add habit' }),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole('textbox', { name: 'Habit' }),
    ).not.toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Add habit' }));
    expect(screen.getByRole('textbox', { name: 'Habit' })).toHaveFocus();
    await user.click(screen.getByRole('button', { name: 'Cancel' }));

    await user.click(screen.getByRole('button', { name: 'Edit' }));

    const name = screen.getByRole('textbox', { name: 'Habit' });
    expect(name).toHaveFocus();
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
    expect(
      screen.getByRole('button', { name: 'Add habit' }),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole('textbox', { name: 'Habit' }),
    ).not.toBeInTheDocument();
  });

  it('reorders habits from the sort control above the cards', async () => {
    window.localStorage.clear();
    const user = userEvent.setup();
    const read = habitItem();
    const walk = habitItem();
    walk.habit = { ...walk.habit, id: 'habit-2', name: 'Walk' };
    walk.doneToday = true;
    walk.currentStreak = 4;

    renderWithProviders(
      <HabitLogger
        habits={[read, walk]}
        onAdd={jest.fn()}
        onUpdate={jest.fn()}
        onToggle={jest.fn()}
        onDelete={jest.fn()}
      />,
    );

    const sort = screen.getByRole('group', { name: 'Sort by:' });
    const names = () =>
      screen.getAllByRole('listitem').map((item) => item.textContent ?? '');

    expect(
      within(sort).getByRole('button', { name: 'Not done' }),
    ).toHaveAttribute('aria-pressed', 'true');
    expect(names()[0]).toContain('Read');

    await user.click(within(sort).getByRole('button', { name: 'Longest' }));

    expect(names()[0]).toContain('Walk');
    expect(
      within(sort).getByRole('button', { name: 'Longest' }),
    ).toHaveAttribute('aria-pressed', 'true');
  });
});
