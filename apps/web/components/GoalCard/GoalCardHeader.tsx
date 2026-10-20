import { Box, Typography } from '@mui/material';

import { formatDateRange } from '@/lib/habits/dates';
import { displayLocale, useTranslation } from '@/lib/i18n';

import {
  nameStyle,
  rangeStyle,
  statusStyle,
  titleStyle,
  topStyle,
} from './GoalCard.style';

type GoalCardHeaderProps = {
  name: string;
  caption: string;
  startDate: string;
  endDate: string;
};

function GoalCardHeader({
  name,
  caption,
  startDate,
  endDate,
}: GoalCardHeaderProps) {
  const { i18n } = useTranslation();
  const locale = displayLocale(i18n.resolvedLanguage ?? i18n.language);

  return (
    <Box sx={topStyle}>
      <Box sx={titleStyle}>
        <Typography variant="h6" component="h2" sx={nameStyle}>
          {name}
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
        {formatDateRange(startDate, endDate, locale)}
      </Typography>
    </Box>
  );
}

export { GoalCardHeader };
