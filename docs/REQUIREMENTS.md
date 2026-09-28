# Habit log requirements

## Product

A personal log for habits you do every day. You add a habit, mark whether you did it today, and see a streak that grows when you keep going.

Version 1 is one person, with no login. Habits and completions are stored in the browser for one local user id.

Charts and a wider dashboard come later. This version is the logger.

## Version 1

- Add a habit by name.
- For each habit, mark today done, or undo that mark.
- The home page is a month calendar. Each day is a cell listing the habits marked done that day.
- Adding a habit and marking today done happens on a separate log page.
- Show the last 7 days and the current streak on each habit.
- A streak is consecutive days completed. Today stays open until you log it, so a morning visit does not wipe yesterday’s run.
- Refreshing the page keeps the data.

## Later

- Charts and a summary dashboard
- Schedules other than every day
- Signup, login, and sync across devices
- Reminders

## Fit with this repo

- The stack stays Next.js, React, TypeScript, and MUI, including the light and dark theme.
- The home page is this logger.
- A phone-width layout stays usable. Actions have visible labels and work from the keyboard.
