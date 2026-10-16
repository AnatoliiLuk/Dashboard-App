import { Box, Typography } from '@mui/material';

import { formatDisplay } from '@/lib/habits/dates';
import { useTranslation } from '@/lib/i18n';

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
  const { t } = useTranslation();

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
        {t('goals.range', {
          start: formatDisplay(startDate),
          end: formatDisplay(endDate),
        })}
      </Typography>
    </Box>
  );
}

export { GoalCardHeader };
