import { describe, expect, it, jest } from '@jest/globals';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { Goal, Habit } from '@repo/types';

import { today } from '@/lib/habits/dates';

import { renderWithProviders } from '../../test/render';
import { GoalForm } from './GoalForm';

function habit(id: string, name: string): Habit {
  return {
    id,
    ownerId: 'user-1',
    name,
    createdOn: '2026-10-01',
    color: 'sky',
  };
}

function existingGoal(): Goal {
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

describe('GoalForm', () => {
  it('stays disabled until the user has a habit', () => {
    renderWithProviders(<GoalForm habits={[]} onAdd={jest.fn()} />);

    expect(
      screen.getByText('Create a habit before you can add a goal.'),
    ).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Add' })).toBeDisabled();
    expect(screen.getByRole('combobox', { name: 'Color' })).toHaveAttribute(
      'aria-disabled',
      'true',
    );
    expect(screen.getByRole('combobox', { name: 'Habits' })).toBeDisabled();
  });

  it('shows today in day-month-year order', () => {
    renderWithProviders(
      <GoalForm habits={[habit('habit-1', 'Read')]} onAdd={jest.fn()} />,
    );

    const [year, month, day] = today().split('-');
    const start = screen.getByRole('group', { name: 'Start date' });
    const digits = start.textContent?.replace(/\D/g, '') ?? '';
    expect(digits).toContain(`${day}${month}${year}`);
  });

  it('does not let a fifth habit be selected', async () => {
    const user = userEvent.setup();
    const habits = [1, 2, 3, 4, 5].map((number) =>
      habit(`habit-${number}`, `Habit ${number}`),
    );

    renderWithProviders(<GoalForm habits={habits} onAdd={jest.fn()} />);

    await user.click(screen.getByRole('combobox', { name: 'Habits' }));

    for (const number of [1, 2, 3, 4]) {
      await user.click(screen.getByRole('option', { name: `Habit ${number}` }));
    }

    expect(screen.getByRole('option', { name: 'Habit 5' })).toHaveAttribute(
      'aria-disabled',
      'true',
    );
  });

  it('saves changes to the goal already in the form', async () => {
    const user = userEvent.setup();
    const onUpdate = jest.fn(async () => undefined);
    const onAdd = jest.fn();

    renderWithProviders(
      <GoalForm
        habits={[habit('habit-1', 'Read')]}
        editing={existingGoal()}
        onAdd={onAdd}
        onUpdate={onUpdate}
        onCancel={jest.fn()}
      />,
    );

    const name = screen.getByRole('textbox', { name: 'Goal' });
    expect(screen.getByText('Editing October focus')).toBeInTheDocument();
    expect(name).toHaveValue('October focus');
    expect(screen.getByRole('combobox', { name: 'Color' })).toHaveTextContent(
      'Indigo',
    );
    expect(screen.getByText('Read')).toBeInTheDocument();

    await user.clear(name);
    await user.type(name, 'November focus');
    await user.click(screen.getByRole('button', { name: 'Save' }));

    expect(onAdd).not.toHaveBeenCalled();
    expect(onUpdate).toHaveBeenCalledWith('goal-1', {
      name: 'November focus',
      color: 'indigo',
      startDate: '2026-10-01',
      endDate: '2026-10-10',
      habitIds: ['habit-1'],
    });
  });

  it('leaves the goal unchanged when editing is cancelled', async () => {
    const user = userEvent.setup();
    const onCancel = jest.fn();
    const onUpdate = jest.fn();

    renderWithProviders(
      <GoalForm
        habits={[habit('habit-1', 'Read')]}
        editing={existingGoal()}
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
