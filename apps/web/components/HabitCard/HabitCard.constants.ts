import {
  CircleCheckIcon,
  CircleExclamationIcon,
  CircleInfoIcon,
} from '@/components/icons';

import type { HabitStatus } from './HabitCard.interface';

export const statusIcon = {
  success: CircleCheckIcon,
  warning: CircleExclamationIcon,
  info: CircleInfoIcon,
} satisfies Record<HabitStatus, typeof CircleCheckIcon>;
