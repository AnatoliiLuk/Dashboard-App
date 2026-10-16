import type { GoalListItem } from './GoalLogger.interface';
import { GOAL_SORT_KEY, GOAL_SORTS, GoalSort } from './GoalLogger.constants';

export function loadGoalSort(): GoalSort {
  if (typeof window === 'undefined') {
    return GoalSort.Newest;
  }

  const stored = window.localStorage.getItem(GOAL_SORT_KEY);
  return isGoalSort(stored) ? stored : GoalSort.Newest;
}

export function saveGoalSort(sort: GoalSort) {
  window.localStorage.setItem(GOAL_SORT_KEY, sort);
}

export function sortGoals(
  goals: readonly GoalListItem[],
  sort: GoalSort,
): GoalListItem[] {
  return [...goals].sort((left, right) => compareGoals(left, right, sort));
}

function compareGoals(
  left: GoalListItem,
  right: GoalListItem,
  sort: GoalSort,
): number {
  if (sort === GoalSort.Newest || sort === GoalSort.Oldest) {
    const created = left.goal.id.localeCompare(right.goal.id);
    return sort === GoalSort.Oldest ? created : -created;
  }

  const length = left.timeline.total - right.timeline.total;
  if (length !== 0) {
    return sort === GoalSort.Shortest ? length : -length;
  }

  return left.goal.name.localeCompare(right.goal.name);
}

function isGoalSort(value: string | null): value is GoalSort {
  return GOAL_SORTS.some((sort) => sort === value);
}
