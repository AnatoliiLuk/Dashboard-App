import type { GoalTimeline, GoalTimelineDay } from '@repo/core';
import type { TFunction } from 'i18next';

export function timePercent(timeline: GoalTimeline): number {
  if (timeline.total === 0) {
    return 0;
  }

  return Math.round((timeline.day / timeline.total) * 100);
}

export function chartValue(day: GoalTimelineDay): number | null {
  if (day.state === 'future' || (day.state === 'open' && day.logged === 0)) {
    return null;
  }

  return day.logged;
}

export function timelineCaption(
  timeline: GoalTimeline,
  translate: TFunction,
): string {
  if (timeline.total === 0 || (timeline.day > 0 && timeline.left === 0)) {
    return translate('goals.complete');
  }

  if (timeline.day === 0) {
    return translate('goals.startsIn', { count: timeline.startsIn });
  }

  return translate('goals.time', {
    day: timeline.day,
    total: timeline.total,
    left: translate('goals.daysLeft', { count: timeline.left }),
  });
}

export function timelineLabel(
  timeline: GoalTimeline,
  translate: TFunction,
): string {
  if (timeline.total === 0 || timeline.day === 0) {
    return timelineCaption(timeline, translate);
  }

  const closed = timeline.days.filter((day) => day.state === 'closed');
  const logged = closed.filter((day) => day.logged > 0).length;

  if (timeline.left === 0) {
    return translate('goals.timelineDone', { logged, count: closed.length });
  }

  if (closed.length === 0) {
    const today = timeline.days.find((day) => day.state === 'open');
    if (today && today.logged > 0) {
      return translate('goals.timelineTodayLogged', {
        day: timeline.day,
        total: timeline.total,
      });
    }

    return translate('goals.timelineTodayOpen', {
      day: timeline.day,
      total: timeline.total,
    });
  }

  return translate('goals.timeline', {
    day: timeline.day,
    total: timeline.total,
    logged,
    count: closed.length,
  });
}
