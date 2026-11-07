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
    days: [{ date: '2026-10-06', done: false, loggable: true }],
    ...overrides,
  };
}

function archivedItem(): HabitToday {
  const item = habitItem();
  return {
    ...item,
    habit: { ...item.habit, archivedAt: '2026-10-18T09:00:00.000Z' },
    days: item.days.map((day) => ({ ...day, loggable: false })),
  };
}

const recentDays: HabitToday['days'] = [
  { date: '2026-10-05', done: false, loggable: false },
  { date: '2026-10-06', done: false, loggable: true },
  { date: '2026-10-07', done: true, loggable: true },
];

describe('HabitCard', () => {
  it('marks today done', async () => {
    const user = userEvent.setup();
    const onToggle = jest.fn();

    renderWithProviders(
      <HabitCard
        item={habitItem()}
        onToggle={onToggle}
        onEdit={jest.fn()}
        onArchive={jest.fn()}
        onDelete={jest.fn()}
      />,
    );

    expect(screen.getByText('Read')).toBeInTheDocument();
    expect(screen.getByTitle('6 Oct 2026')).toHaveTextContent('T');
    expect(
      screen.getByText('Do it today to start a streak.'),
    ).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Done today' }));

    expect(onToggle).toHaveBeenCalledWith('habit-1');
  });

  it('logs and undoes a past day from the strip', async () => {
    const user = userEvent.setup();
    const onToggle = jest.fn();

    renderWithProviders(
      <HabitCard
        item={habitItem({ days: recentDays })}
        onToggle={onToggle}
        onEdit={jest.fn()}
        onArchive={jest.fn()}
        onDelete={jest.fn()}
      />,
    );

    const past = screen.getByRole('button', { name: 'Mark 6 Oct 2026 done' });
    expect(past).toHaveAttribute('aria-pressed', 'false');
    await user.click(past);
    expect(onToggle).toHaveBeenCalledWith('habit-1', '2026-10-06');

    await user.click(screen.getByRole('button', { name: 'Undo 7 Oct 2026' }));
    expect(onToggle).toHaveBeenCalledWith('habit-1', '2026-10-07');
  });

  it('does not offer days before the habit existed', () => {
    renderWithProviders(
      <HabitCard
        item={habitItem({ days: recentDays })}
        onToggle={jest.fn()}
        onEdit={jest.fn()}
        onArchive={jest.fn()}
        onDelete={jest.fn()}
      />,
    );

    expect(screen.getByTitle('5 Oct 2026').tagName).toBe('SPAN');
    expect(
      screen.queryByRole('button', { name: /5 Oct 2026/ }),
    ).not.toBeInTheDocument();
  });

  it('keeps the strip read-only for an archived habit', () => {
    renderWithProviders(
      <HabitCard
        item={archivedItem()}
        onToggle={jest.fn()}
        onEdit={jest.fn()}
        onArchive={jest.fn()}
        onDelete={jest.fn()}
      />,
    );

    expect(
      screen.queryByRole('button', { name: /6 Oct 2026/ }),
    ).not.toBeInTheDocument();
  });

  it('offers undo when today is already done', () => {
    renderWithProviders(
      <HabitCard
        item={habitItem({ doneToday: true, currentStreak: 1 })}
        onToggle={jest.fn()}
        onEdit={jest.fn()}
        onArchive={jest.fn()}
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
        onArchive={jest.fn()}
        onDelete={jest.fn()}
      />,
    );

    const edit = screen.getByRole('button', { name: 'Edit' });
    expect(edit).toHaveAttribute('aria-pressed', 'true');

    await user.click(edit);

    expect(onEdit).toHaveBeenCalledTimes(1);
  });

  it('archives an active habit instead of deleting it', async () => {
    const user = userEvent.setup();
    const onArchive = jest.fn();

    renderWithProviders(
      <HabitCard
        item={habitItem()}
        onToggle={jest.fn()}
        onEdit={jest.fn()}
        onArchive={onArchive}
        onDelete={jest.fn()}
      />,
    );

    expect(
      screen.queryByRole('button', { name: 'Delete' }),
    ).not.toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Archive' }));

    expect(onArchive).toHaveBeenCalledWith('habit-1', true);
  });

  it('restores an archived habit', async () => {
    const user = userEvent.setup();
    const onArchive = jest.fn();

    renderWithProviders(
      <HabitCard
        item={archivedItem()}
        onToggle={jest.fn()}
        onEdit={jest.fn()}
        onArchive={onArchive}
        onDelete={jest.fn()}
      />,
    );

    expect(screen.getByText('Archived on 18 Oct 2026')).toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: 'Done today' }),
    ).not.toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Restore' }));

    expect(onArchive).toHaveBeenCalledWith('habit-1', false);
  });

  it('deletes an archived habit forever only after confirmation', async () => {
    const user = userEvent.setup();
    const onDelete = jest.fn();

    renderWithProviders(
      <HabitCard
        item={archivedItem()}
        onToggle={jest.fn()}
        onEdit={jest.fn()}
        onArchive={jest.fn()}
        onDelete={onDelete}
      />,
    );

    await user.click(screen.getByRole('button', { name: 'Delete' }));
    expect(onDelete).not.toHaveBeenCalled();

    await user.click(screen.getByRole('button', { name: 'Delete forever' }));
    expect(onDelete).toHaveBeenCalledWith('habit-1');
  });
});
