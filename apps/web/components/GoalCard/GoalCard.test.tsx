import { describe, expect, it, jest } from '@jest/globals';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { GoalTimeline } from '@repo/core';
import type { Goal, Habit } from '@repo/types';

import { renderWithProviders } from '../../test/render';
import { GoalCard } from './GoalCard';

function goal(overrides: Partial<Goal> = {}): Goal {
  return {
    id: 'goal-1',
    ownerId: 'user-1',
    name: 'October focus',
    color: 'indigo',
    startDate: '2026-10-01',
    endDate: '2026-10-10',
    habitIds: ['habit-1', 'habit-2'],
    ...overrides,
  };
}

function habit(id: string, name: string): Habit {
  return {
    id,
    ownerId: 'user-1',
    name,
    createdOn: '2026-10-01',
    color: 'sky',
  };
}

function day(
  date: string,
  logged: number,
  state: GoalTimeline['days'][number]['state'],
): GoalTimeline['days'][number] {
  return { date, logged, state };
}

function timeline(overrides: Partial<GoalTimeline> = {}): GoalTimeline {
  return {
    day: 5,
    total: 10,
    left: 6,
    startsIn: 0,
    days: [
      day('2026-10-01', 1, 'closed'),
      day('2026-10-02', 2, 'closed'),
      day('2026-10-03', 0, 'closed'),
      day('2026-10-04', 1, 'closed'),
      day('2026-10-05', 0, 'open'),
      day('2026-10-06', 0, 'future'),
      day('2026-10-07', 0, 'future'),
      day('2026-10-08', 0, 'future'),
      day('2026-10-09', 0, 'future'),
      day('2026-10-10', 0, 'future'),
    ],
    ...overrides,
  };
}

function renderCard(overrides: Partial<GoalTimeline> = {}) {
  renderWithProviders(
    <GoalCard
      goal={goal()}
      habits={[habit('habit-1', 'Read'), habit('habit-2', 'Walk')]}
      timeline={timeline(overrides)}
      onEdit={jest.fn()}
      onDelete={jest.fn()}
    />,
  );
}

describe('GoalCard', () => {
  it('shows time position and how many habits were logged each day', () => {
    renderCard();

    expect(
      screen.getByRole('heading', { name: 'October focus' }),
    ).toBeInTheDocument();
    expect(screen.getByText('Read')).toBeInTheDocument();
    expect(screen.getByText('Walk')).toBeInTheDocument();
    expect(screen.getByText('1 – 10 Oct 2026')).toBeInTheDocument();
    expect(screen.getByText('Habits logged')).toBeInTheDocument();
    expect(screen.getByText('50%')).toBeInTheDocument();
    expect(screen.getByText('Day 5 of 10 · 6 days left')).toBeInTheDocument();

    const track = screen.getByRole('progressbar', {
      name: 'Day 5 of 10 · 6 days left',
    });
    expect(track).toHaveAttribute('aria-valuenow', '50');
    expect(track).toHaveAttribute('aria-valuemax', '100');
    expect(
      screen.getByRole('group', {
        name: 'Day 5 of 10. Logged habits on 3 of 4 closed days.',
      }),
    ).toBeInTheDocument();
  });

  it('shows one date when the goal lasts a single day', () => {
    renderWithProviders(
      <GoalCard
        goal={goal({ startDate: '2026-10-15', endDate: '2026-10-15' })}
        habits={[habit('habit-1', 'Read')]}
        timeline={timeline({
          day: 1,
          total: 1,
          left: 0,
          days: [day('2026-10-15', 1, 'closed')],
        })}
        onEdit={jest.fn()}
        onDelete={jest.fn()}
      />,
    );

    expect(screen.getByText('15 Oct 2026')).toBeInTheDocument();
  });

  it('fills today when a habit is already logged and keeps the day open', () => {
    renderCard({
      days: [day('2026-10-01', 0, 'future'), day('2026-10-05', 1, 'open')],
      day: 1,
      total: 1,
      left: 1,
    });

    expect(screen.getByText('100%')).toBeInTheDocument();
    expect(screen.getByText('Day 1 of 1 · 1 day left')).toBeInTheDocument();
    expect(
      screen.getByRole('progressbar', { name: 'Day 1 of 1 · 1 day left' }),
    ).toHaveAttribute('aria-valuenow', '100');
    expect(
      screen.getByRole('group', { name: 'Day 1 of 1. Logged today.' }),
    ).toBeInTheDocument();
  });

  it('says when the goal has not started', () => {
    renderCard({
      day: 0,
      total: 10,
      left: 10,
      startsIn: 3,
      days: [day('2026-10-01', 0, 'future')],
    });

    expect(screen.getByText('0%')).toBeInTheDocument();
    expect(screen.getByText('Starts in 3 days')).toBeInTheDocument();
    expect(
      screen.getByRole('progressbar', { name: 'Starts in 3 days' }),
    ).toHaveAttribute('aria-valuenow', '0');
    expect(
      screen.getByRole('group', { name: 'Starts in 3 days' }),
    ).toBeInTheDocument();
  });

  it('marks a finished goal at the end of the track', () => {
    renderCard({
      day: 10,
      total: 10,
      left: 0,
      days: [day('2026-10-10', 2, 'closed')],
    });

    expect(screen.getByText('100%')).toBeInTheDocument();
    expect(screen.getByText('Complete')).toBeInTheDocument();
    expect(
      screen.getByRole('progressbar', { name: 'Complete' }),
    ).toHaveAttribute('aria-valuenow', '100');
    expect(
      screen.getByRole('group', {
        name: 'Complete. Logged habits on 1 of 1 day.',
      }),
    ).toBeInTheDocument();
  });

  it('deletes only after confirmation', async () => {
    const user = userEvent.setup();
    const onDelete = jest.fn();

    renderWithProviders(
      <GoalCard
        goal={goal()}
        habits={[habit('habit-1', 'Read')]}
        timeline={timeline()}
        onEdit={jest.fn()}
        onDelete={onDelete}
      />,
    );

    await user.click(screen.getByRole('button', { name: 'Delete' }));
    expect(onDelete).not.toHaveBeenCalled();

    await user.click(screen.getByRole('button', { name: 'Delete' }));
    expect(onDelete).toHaveBeenCalledWith('goal-1');
  });

  it('asks the parent to edit the goal', async () => {
    const user = userEvent.setup();
    const onEdit = jest.fn();

    renderWithProviders(
      <GoalCard
        goal={goal()}
        habits={[habit('habit-1', 'Read')]}
        timeline={timeline()}
        onEdit={onEdit}
        onDelete={jest.fn()}
      />,
    );

    await user.click(screen.getByRole('button', { name: 'Edit' }));

    expect(onEdit).toHaveBeenCalledTimes(1);
    expect(
      screen.getByRole('heading', { name: 'October focus' }),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole('textbox', { name: 'Goal' }),
    ).not.toBeInTheDocument();
  });
});
