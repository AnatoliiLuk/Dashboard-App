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
        onColor={jest.fn()}
        onRename={jest.fn()}
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
        onColor={jest.fn()}
        onRename={jest.fn()}
        onDelete={jest.fn()}
      />,
    );

    expect(screen.getByRole('button', { name: 'Undo' })).toHaveAttribute(
      'aria-pressed',
      'true',
    );
    expect(screen.getByText('Nice. Today is done.')).toBeInTheDocument();
  });

  it('renames the habit from the edit form', async () => {
    const user = userEvent.setup();
    const onRename = jest.fn();

    renderWithProviders(
      <HabitCard
        item={habitItem()}
        onToggle={jest.fn()}
        onColor={jest.fn()}
        onRename={onRename}
        onDelete={jest.fn()}
      />,
    );

    await user.click(screen.getByRole('button', { name: 'Edit' }));
    const field = screen.getByRole('textbox', { name: 'Habit' });
    await user.clear(field);
    await user.type(field, 'Walk');
    await user.click(screen.getByRole('button', { name: 'Save' }));

    expect(onRename).toHaveBeenCalledWith('habit-1', 'Walk');
  });

  it('keeps the saved name when the edit is blank', async () => {
    const user = userEvent.setup();
    const onRename = jest.fn();

    renderWithProviders(
      <HabitCard
        item={habitItem()}
        onToggle={jest.fn()}
        onColor={jest.fn()}
        onRename={onRename}
        onDelete={jest.fn()}
      />,
    );

    await user.click(screen.getByRole('button', { name: 'Edit' }));
    await user.clear(screen.getByRole('textbox', { name: 'Habit' }));
    await user.click(screen.getByRole('button', { name: 'Save' }));

    expect(onRename).not.toHaveBeenCalled();
    expect(screen.getByRole('textbox', { name: 'Habit' })).toBeInTheDocument();
  });

  it('changes the color while editing', async () => {
    const user = userEvent.setup();
    const onColor = jest.fn();

    renderWithProviders(
      <HabitCard
        item={habitItem()}
        onToggle={jest.fn()}
        onColor={onColor}
        onRename={jest.fn()}
        onDelete={jest.fn()}
      />,
    );

    await user.click(screen.getByRole('button', { name: 'Edit' }));
    await user.click(screen.getByRole('radio', { name: 'Green' }));

    expect(onColor).toHaveBeenCalledWith('habit-1', 'green');
  });

  it('deletes only after confirmation', async () => {
    const user = userEvent.setup();
    const onDelete = jest.fn();

    renderWithProviders(
      <HabitCard
        item={habitItem()}
        onToggle={jest.fn()}
        onColor={jest.fn()}
        onRename={jest.fn()}
        onDelete={onDelete}
      />,
    );

    await user.click(screen.getByRole('button', { name: 'Delete' }));
    expect(onDelete).not.toHaveBeenCalled();

    await user.click(screen.getByRole('button', { name: 'Delete' }));
    expect(onDelete).toHaveBeenCalledWith('habit-1');
  });
});
