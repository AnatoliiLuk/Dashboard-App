import { describe, expect, it, jest } from '@jest/globals';
import { screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { GoalTimeline } from '@repo/core';
import type { Goal, Habit } from '@repo/types';

import { renderWithProviders } from '../../test/render';
import { GoalLogger } from './GoalLogger';

function goal(): Goal {
  return {
    id: 'goal-1',
    ownerId: 'user-1',
    name: 'October focus',
    color: 'indigo',
    startDate: '2026-10-01',
    endDate: '2026-10-10',
    habitIds: ['habit-1'],
  };
}

function emptyTimeline(): GoalTimeline {
  return { day: 5, total: 10, left: 6, startsIn: 0, days: [] };
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

describe('GoalLogger', () => {
  it('fills the main form from the goal being edited', async () => {
    const user = userEvent.setup();
    const onUpdate = jest.fn(async () => undefined);

    renderWithProviders(
      <GoalLogger
        goals={[{ goal: goal(), timeline: emptyTimeline() }]}
        habits={[habit()]}
        onAdd={jest.fn()}
        onUpdate={onUpdate}
        onDelete={jest.fn()}
      />,
    );

    expect(screen.getByRole('button', { name: 'Add' })).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Edit' }));

    const name = screen.getByRole('textbox', { name: 'Goal' });
    expect(name).toHaveValue('October focus');
    expect(screen.getByRole('button', { name: 'Edit' })).toHaveAttribute(
      'aria-pressed',
      'true',
    );

    await user.clear(name);
    await user.type(name, 'November focus');
    await user.click(screen.getByRole('button', { name: 'Save' }));

    expect(onUpdate).toHaveBeenCalledWith(
      'goal-1',
      expect.objectContaining({ name: 'November focus' }),
    );
    expect(screen.getByRole('button', { name: 'Add' })).toBeInTheDocument();
    expect(screen.getByRole('textbox', { name: 'Goal' })).toHaveValue('');
  });

  it('reorders goals from the sort control above the cards', async () => {
    window.localStorage.clear();
    const user = userEvent.setup();
    const short = goal();
    short.id = 'c0';
    short.name = 'Short';
    const long = goal();
    long.id = 'c1';
    long.name = 'Long';

    renderWithProviders(
      <GoalLogger
        goals={[
          { goal: short, timeline: { ...emptyTimeline(), total: 2 } },
          { goal: long, timeline: { ...emptyTimeline(), total: 20 } },
        ]}
        habits={[habit()]}
        onAdd={jest.fn()}
        onUpdate={jest.fn()}
        onDelete={jest.fn()}
      />,
    );

    const sort = screen.getByRole('group', { name: 'Sort by:' });
    const names = () =>
      screen
        .getAllByRole('heading', { level: 2 })
        .map((heading) => heading.textContent);

    expect(
      within(sort).getByRole('button', { name: 'Newest' }),
    ).toHaveAttribute('aria-pressed', 'true');
    expect(names()).toEqual(['Long', 'Short']);

    await user.click(within(sort).getByRole('button', { name: 'Shortest' }));

    expect(names()).toEqual(['Short', 'Long']);
    expect(
      within(sort).getByRole('button', { name: 'Shortest' }),
    ).toHaveAttribute('aria-pressed', 'true');
  });
});
