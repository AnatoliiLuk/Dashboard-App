import { describe, expect, it, jest } from '@jest/globals';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
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
    habitIds: ['habit-1'],
    ...overrides,
  };
}

function habit(): Habit {
  return {
    id: 'habit-1',
    ownerId: 'user-1',
    name: 'Read',
    createdOn: '2026-10-01',
    color: 'sky',
  };
}

describe('GoalCard', () => {
  it('shows the progress percent', () => {
    renderWithProviders(
      <GoalCard
        goal={goal()}
        habits={[habit()]}
        percent={20}
        onEdit={jest.fn()}
        onDelete={jest.fn()}
      />,
    );

    expect(
      screen.getByRole('heading', { name: 'October focus' }),
    ).toBeInTheDocument();
    expect(screen.getByText('20%')).toBeInTheDocument();
    expect(
      screen.getByRole('progressbar', { name: 'Progress' }),
      // cspell:disable-next-line
    ).toHaveAttribute('aria-valuenow', '20');
    expect(screen.getByText('Read')).toBeInTheDocument();
    expect(screen.getByText('01-10-2026 – 10-10-2026')).toBeInTheDocument();
  });

  it('deletes only after confirmation', async () => {
    const user = userEvent.setup();
    const onDelete = jest.fn();

    renderWithProviders(
      <GoalCard
        goal={goal()}
        habits={[habit()]}
        percent={20}
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
        habits={[habit()]}
        percent={20}
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
