import { describe, expect, it, jest } from '@jest/globals';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import type { HabitToday } from '@/lib/habits/log';

import { HabitCard } from './HabitCard';
import { renderWithProviders } from '../../test/render';

function habitItem(overrides: Partial<HabitToday> = {}): HabitToday {
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
    ...overrides,
  };
}

describe('HabitCard', () => {
  it('marks today done', async () => {
    const user = userEvent.setup();
    const onToggle = jest.fn();

    renderWithProviders(
      <HabitCard
        item={habitItem()}
        onToggle={onToggle}
        onEdit={jest.fn()}
        onDelete={jest.fn()}
      />,
    );

    expect(screen.getByText('Read')).toBeInTheDocument();
    expect(
      screen.getByText('Do it today to start a streak.'),
    ).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Done today' }));

    expect(onToggle).toHaveBeenCalledWith('habit-1');
  });

  it('offers undo when today is already done', () => {
    renderWithProviders(
      <HabitCard
        item={habitItem({ doneToday: true, currentStreak: 1 })}
        onToggle={jest.fn()}
        onEdit={jest.fn()}
        onDelete={jest.fn()}
      />,
    );

    expect(screen.getByRole('button', { name: 'Undo' })).toHaveAttribute(
      'aria-pressed',
      'true',
    );
    expect(screen.getByText('Nice. Today is done.')).toBeInTheDocument();
  });

  it('asks the form to edit this habit', async () => {
    const user = userEvent.setup();
    const onEdit = jest.fn();

    renderWithProviders(
      <HabitCard
        item={habitItem()}
        selected
        onToggle={jest.fn()}
        onEdit={onEdit}
        onDelete={jest.fn()}
      />,
    );

    const edit = screen.getByRole('button', { name: 'Edit' });
    expect(edit).toHaveAttribute('aria-pressed', 'true');

    await user.click(edit);

    expect(onEdit).toHaveBeenCalledTimes(1);
  });

  it('deletes only after confirmation', async () => {
    const user = userEvent.setup();
    const onDelete = jest.fn();

    renderWithProviders(
      <HabitCard
        item={habitItem()}
        onToggle={jest.fn()}
        onEdit={jest.fn()}
        onDelete={onDelete}
      />,
    );

    await user.click(screen.getByRole('button', { name: 'Delete' }));
    expect(onDelete).not.toHaveBeenCalled();

    await user.click(screen.getByRole('button', { name: 'Delete' }));
    expect(onDelete).toHaveBeenCalledWith('habit-1');
  });
});
