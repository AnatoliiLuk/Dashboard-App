'use client';

import type { GoalTimeline, GoalTimelineDay } from '@repo/core';
import { Box, LinearProgress, Typography } from '@mui/material';
import { BarChart } from '@mui/x-charts/BarChart';
import type { ReactNode } from 'react';
import { useState } from 'react';

import { HabitTag } from '@/components/HabitTag';
import { formatDisplay } from '@/lib/habits/dates';
import { goalColor } from '@/lib/goals/colors';
import { useTranslation } from '@/lib/i18n';

import type { GoalCardProps } from './GoalCard.interface';
import {
  actionsStyle,
  bandStyle,
  bodyStyle,
  chartLabelStyle,
  chartStyle,
  chipsStyle,
  deleteStyle,
  footerStyle,
  goalStyle,
  nameStyle,
  percentStyle,
  progressRowStyle,
  progressStyle,
  progressTrackStyle,
  rangeStyle,
  selectedGoalStyle,
  statusStyle,
  titleStyle,
  toggleStyle,
  topStyle,
} from './GoalCard.style';

function GoalCard({
  goal,
  habits,
  timeline,
  selected = false,
  onEdit,
  onDelete,
}: GoalCardProps) {
  const { t } = useTranslation();
  const [confirmDelete, setConfirmDelete] = useState(false);
  const linked = goal.habitIds.flatMap((id) => {
    const habit = habits.find((item) => item.id === id);
    return habit ? [habit] : [];
  });
  const habitCount = goal.habitIds.length;
  const percent = timePercent(timeline);
  const percentLabel = t('goals.percent', { percent });
  const caption = timelineCaption(timeline, t);

  let actions: ReactNode;
  if (confirmDelete) {
    actions = (
      <>
        <Box
          component="button"
          type="button"
          sx={[toggleStyle, deleteStyle]}
          onClick={() => {
            void onDelete(goal.id);
          }}
        >
          {t('common.delete')}
        </Box>
        <Box
          component="button"
          type="button"
          sx={toggleStyle}
          onClick={() => setConfirmDelete(false)}
        >
          {t('common.cancel')}
        </Box>
      </>
    );
  } else {
    actions = (
      <>
        <Box
          component="button"
          type="button"
          sx={toggleStyle}
          aria-pressed={selected}
          onClick={onEdit}
        >
          {t('common.edit')}
        </Box>
        <Box
          component="button"
          type="button"
          sx={toggleStyle}
          onClick={() => setConfirmDelete(true)}
        >
          {t('common.delete')}
        </Box>
      </>
    );
  }

  return (
    <Box
      component="li"
      sx={selected ? [goalStyle, selectedGoalStyle] : goalStyle}
    >
      <Box sx={bandStyle(goal.color)} aria-hidden="true" />
      <Box sx={bodyStyle}>
        <Box sx={topStyle}>
          <Box sx={titleStyle}>
            <Typography variant="h6" component="h2" sx={nameStyle}>
              {goal.name}
            </Typography>
            <Typography
              variant="body2"
              component="span"
              aria-hidden="true"
              sx={statusStyle}
            >
              ·
            </Typography>
            <Typography variant="body2" component="span" sx={statusStyle}>
              {caption}
            </Typography>
          </Box>
          <Typography variant="body2" sx={rangeStyle}>
            {t('goals.range', {
              start: formatDisplay(goal.startDate),
              end: formatDisplay(goal.endDate),
            })}
          </Typography>
        </Box>
        <Box sx={progressRowStyle}>
          <Box sx={progressTrackStyle}>
            <LinearProgress
              variant="determinate"
              value={percent}
              aria-label={caption}
              sx={progressStyle(goal.color)}
            />
            <Typography
              variant="body2"
              component="span"
              sx={percentStyle(percent)}
            >
              {percentLabel}
            </Typography>
          </Box>
        </Box>
        {linked.length > 0 ? (
          <Box
            component="ul"
            sx={chipsStyle}
            aria-label={t('goals.linkedHabits')}
          >
            {linked.map((habit) => (
              <Box component="li" key={habit.id}>
                <HabitTag name={habit.name} color={habit.color} />
              </Box>
            ))}
          </Box>
        ) : null}
        {timeline.days.length > 0 ? (
          <>
            <Typography variant="body2" sx={chartLabelStyle}>
              {t('goals.chart')}
            </Typography>
            <Box
              role="group"
              aria-label={timelineLabel(timeline, t)}
              sx={chartStyle}
            >
              <BarChart
                height={140}
                hideLegend
                borderRadius={4}
                xAxis={[
                  {
                    scaleType: 'band',
                    data: timeline.days.map((day) => day.date),
                    valueFormatter: (value, context) =>
                      context.location === 'tick'
                        ? String(value).slice(8)
                        : formatDisplay(String(value)),
                    height: 28,
                  },
                ]}
                yAxis={[
                  {
                    min: 0,
                    max: Math.max(habitCount, 1),
                    tickInterval: Array.from(
                      { length: Math.max(habitCount, 1) + 1 },
                      (_, index) => index,
                    ),
                    valueFormatter: (value: number) => String(value),
                    width: 36,
                  },
                ]}
                series={[
                  {
                    data: timeline.days.map((day) => chartValue(day)),
                    color: goalColor(goal.color).bar,
                    label: t('goals.chart'),
                    valueFormatter: (value) =>
                      value == null
                        ? null
                        : t('goals.loggedOf', {
                            logged: value,
                            total: habitCount,
                          }),
                  },
                ]}
                margin={{ top: 16, right: 8, bottom: 0, left: 0 }}
              />
            </Box>
          </>
        ) : null}
        <Box sx={footerStyle}>
          <Box sx={actionsStyle}>{actions}</Box>
        </Box>
      </Box>
    </Box>
  );
}

function timePercent(timeline: GoalTimeline): number {
  if (timeline.total === 0) {
    return 0;
  }

  return Math.round((timeline.day / timeline.total) * 100);
}

function chartValue(day: GoalTimelineDay): number | null {
  if (day.state === 'future' || (day.state === 'open' && day.logged === 0)) {
    return null;
  }

  return day.logged;
}

function timelineCaption(
  timeline: GoalTimeline,
  t: ReturnType<typeof useTranslation>['t'],
): string {
  if (timeline.total === 0 || (timeline.day > 0 && timeline.left === 0)) {
    return t('goals.complete');
  }

  if (timeline.day === 0) {
    return t('goals.startsIn', { count: timeline.startsIn });
  }

  return t('goals.time', {
    day: timeline.day,
    total: timeline.total,
    left: t('goals.daysLeft', { count: timeline.left }),
  });
}

function timelineLabel(
  timeline: GoalTimeline,
  t: ReturnType<typeof useTranslation>['t'],
): string {
  if (timeline.total === 0 || timeline.day === 0) {
    return timelineCaption(timeline, t);
  }

  const closed = timeline.days.filter((day) => day.state === 'closed');
  const logged = closed.filter((day) => day.logged > 0).length;

  if (timeline.left === 0) {
    return t('goals.timelineDone', { logged, count: closed.length });
  }

  if (closed.length === 0) {
    const today = timeline.days.find((day) => day.state === 'open');
    if (today && today.logged > 0) {
      return t('goals.timelineTodayLogged', {
        day: timeline.day,
        total: timeline.total,
      });
    }

    return t('goals.timelineTodayOpen', {
      day: timeline.day,
      total: timeline.total,
    });
  }

  return t('goals.timeline', {
    day: timeline.day,
    total: timeline.total,
    logged,
    count: closed.length,
  });
}

export { GoalCard };
