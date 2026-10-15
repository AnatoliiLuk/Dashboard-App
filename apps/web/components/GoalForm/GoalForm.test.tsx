import { describe, expect, it, jest } from '@jest/globals';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { Habit } from '@repo/types';

import { formatDisplay, today } from '@/lib/habits/dates';

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

describe('GoalForm', () => {
  it('stays disabled until the user has a habit', () => {
    renderWithProviders(<GoalForm habits={[]} onAdd={jest.fn()} />);

    expect(
      screen.getByText('Create a habit before you can add a goal.'),
    ).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Add' })).toBeDisabled();
    expect(screen.getByRole('radio', { name: 'Indigo' })).toBeDisabled();
    expect(screen.getByRole('combobox', { name: 'Habits' })).toBeDisabled();
  });

  it('shows today in day-month-year order', () => {
    renderWithProviders(
      <GoalForm habits={[habit('habit-1', 'Read')]} onAdd={jest.fn()} />,
    );

    const [day, month, year] = formatDisplay(today()).split('-');
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
});
