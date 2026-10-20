import type { GoalTimelineDay } from '@repo/core';
import { Box, Typography } from '@mui/material';
import { BarChart } from '@mui/x-charts/BarChart';

import { formatDisplay } from '@/lib/habits/dates';
import { goalColor, type GoalColor } from '@/lib/goals/colors';
import { displayLocale, useTranslation } from '@/lib/i18n';

import { chartValue } from './GoalCard.helpers';
import { chartLabelStyle, chartStyle } from './GoalCard.style';

type GoalHabitChartProps = {
  days: GoalTimelineDay[];
  habitCount: number;
  color: GoalColor;
  label: string;
};

function GoalHabitChart({
  days,
  habitCount,
  color,
  label,
}: GoalHabitChartProps) {
  const { t, i18n } = useTranslation();
  const locale = displayLocale(i18n.resolvedLanguage ?? i18n.language);

  if (days.length === 0) {
    return null;
  }

  const max = Math.max(habitCount, 1);

  return (
    <>
      <Typography variant="body2" sx={chartLabelStyle}>
        {t('goals.chart')}
      </Typography>
      <Box role="group" aria-label={label} sx={chartStyle}>
        <BarChart
          height={140}
          hideLegend
          borderRadius={4}
          xAxis={[
            {
              scaleType: 'band',
              data: days.map((day) => day.date),
              valueFormatter: (value, context) =>
                context.location === 'tick'
                  ? String(value).slice(8)
                  : formatDisplay(String(value), locale),
              height: 28,
            },
          ]}
          yAxis={[
            {
              min: 0,
              max,
              tickInterval: Array.from(
                { length: max + 1 },
                (_, index) => index,
              ),
              valueFormatter: (value: number) => String(value),
              width: 36,
            },
          ]}
          series={[
            {
              data: days.map((day) => chartValue(day)),
              color: goalColor(color).bar,
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
  );
}

export { GoalHabitChart };
