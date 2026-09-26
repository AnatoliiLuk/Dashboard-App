'use client';

import { Box, Button, TextField } from '@mui/material';
import { useState } from 'react';

import { ColorPicker } from '@/components/ColorPicker';
import { HABIT_COLORS, type HabitColor } from '@/lib/habits/colors';

import { formStyle, nameFieldStyle } from './HabitForm.style';

type HabitFormProps = {
  onAdd: (name: string, color: HabitColor) => void;
};

function HabitForm({ onAdd }: HabitFormProps) {
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
        label="Habit"
        name="habit"
        value={name}
        onChange={(event) => setName(event.target.value)}
        sx={nameFieldStyle}
        size="small"
      />
      <ColorPicker
        value={color}
        onChange={setColor}
        label="Color for the new habit"
      />
      <Button type="submit" variant="contained">
        Add
      </Button>
    </Box>
  );
}

export { HabitForm };
