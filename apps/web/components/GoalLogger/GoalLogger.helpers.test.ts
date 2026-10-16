import { describe, expect, it } from '@jest/globals';
import type { GoalTimeline } from '@repo/core';
import type { Goal } from '@repo/types';

import { GoalSort } from './GoalLogger.constants';
import { sortGoals } from './GoalLogger.helpers';
import type { GoalListItem } from './GoalLogger.interface';

function item(id: string, name: string, total: number): GoalListItem {
  const goal: Goal = {
    id,
    ownerId: 'user-1',
    name,
    color: 'indigo',
    startDate: '2026-10-01',
    endDate: '2026-10-10',
    habitIds: [],
  };
  const timeline: GoalTimeline = {
    day: 1,
    total,
    left: total,
    startsIn: 0,
    days: [],
  };

  return { goal, timeline };
}

describe('sortGoals', () => {
  const goals = [
    item('c-early', 'Early', 10),
    item('c-late', 'Late', 3),
    item('c-mid', 'Mid', 10),
  ];

  it('orders goals from newest to oldest by when they were added', () => {
    expect(
      sortGoals(goals, GoalSort.Newest).map((entry) => entry.goal.name),
    ).toEqual(['Mid', 'Late', 'Early']);
  });

  it('orders goals from oldest to newest', () => {
    expect(
      sortGoals(goals, GoalSort.Oldest).map((entry) => entry.goal.name),
    ).toEqual(['Early', 'Late', 'Mid']);
  });

  it('orders goals from the longest stretch to the shortest', () => {
    expect(
      sortGoals(goals, GoalSort.Longest).map((entry) => entry.goal.name),
    ).toEqual(['Early', 'Mid', 'Late']);
  });

  it('orders goals from the shortest stretch to the longest', () => {
    expect(
      sortGoals(goals, GoalSort.Shortest).map((entry) => entry.goal.name),
    ).toEqual(['Late', 'Early', 'Mid']);
  });
});
