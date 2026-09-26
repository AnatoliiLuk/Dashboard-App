'use client';

import { Box, Button, TextField } from '@mui/material';
import { useState } from 'react';

import { ColorPicker } from '@/components/ColorPicker';
import { HABIT_COLORS, type HabitColor } from '@/lib/habits/colors';
import { useTranslation } from '@/lib/i18n';

import { formStyle, nameFieldStyle } from './HabitForm.style';

type HabitFormProps = {
  onAdd: (name: string, color: HabitColor) => void;
};

function HabitForm({ onAdd }: HabitFormProps) {
  const { t } = useTranslation();
  const [name, setName] = useState('');
  const [color, setColor] = useState<HabitColor>(HABIT_COLORS[0].id);

  function submit() {
    const trimmed = name.trim();
    if (!trimmed) {
      return;
    }
    onAdd(trimmed, color);
    setName('');
  }

  return (
    <Box
      component="form"
      sx={formStyle}
      onSubmit={(event) => {
        event.preventDefault();
        submit();
      }}
    >
      <TextField
        label={t('common.habit')}
        name="habit"
        value={name}
        onChange={(event) => setName(event.target.value)}
        sx={nameFieldStyle}
        size="small"
      />
      <ColorPicker
        value={color}
        onChange={setColor}
        label={t('log.newHabitColor')}
      />
      <Button type="submit" variant="contained">
        {t('common.add')}
      </Button>
    </Box>
  );
}

export { HabitForm };
