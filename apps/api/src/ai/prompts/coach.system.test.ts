import { describe, expect, it } from '@jest/globals';

import { COACH_EXAMPLES } from './coach.examples';
import {
  buildCoachSystem,
  COACH_INSTRUCTIONS,
  coachRequestContext,
} from './coach.system';

const TODAY = '2026-10-23';
const HABIT_DATA = '<habit_data>\nActive habits: 0\n</habit_data>';

const STABLE_SECTIONS = [
  'role',
  'scope',
  'tone',
  'honesty',
  'data_handling',
  'format',
  'examples',
];

describe('COACH_INSTRUCTIONS', () => {
  it('has every labelled section, in order', () => {
    const positions = STABLE_SECTIONS.map((name) =>
      COACH_INSTRUCTIONS.indexOf(`<${name}>`),
    );

    expect(positions).not.toContain(-1);
    expect([...positions].sort((a, b) => a - b)).toEqual(positions);
    for (const name of STABLE_SECTIONS) {
      expect(COACH_INSTRUCTIONS).toContain(`</${name}>`);
    }
  });

  it('includes every few-shot example, with at least one in Ukrainian', () => {
    for (const example of COACH_EXAMPLES) {
      expect(COACH_INSTRUCTIONS).toContain(example.user);
      expect(COACH_INSTRUCTIONS).toContain(example.coach);
    }
    expect(
      COACH_EXAMPLES.some(({ user }) => /[\u0400-\u04FF]/.test(user)),
    ).toBe(true);
  });

  it('holds nothing that changes per request, so it can be cached', () => {
    expect(COACH_INSTRUCTIONS).not.toContain(TODAY);
    expect(COACH_INSTRUCTIONS).not.toContain('<language>');
    expect(COACH_INSTRUCTIONS).not.toContain('<today>');
  });
});

describe('coachRequestContext', () => {
  it('names the app language for the given locale', () => {
    expect(coachRequestContext('en', TODAY, HABIT_DATA)).toContain(
      'reply in English',
    );
    expect(coachRequestContext('uk', TODAY, HABIT_DATA)).toContain(
      'reply in Ukrainian',
    );
  });

  it('ends with today and the habit data', () => {
    expect(
      coachRequestContext('en', TODAY, HABIT_DATA).endsWith(
        `<today>${TODAY}</today>\n\n${HABIT_DATA}`,
      ),
    ).toBe(true);
  });
});

describe('buildCoachSystem', () => {
  it('puts the cached instructions first and the request context last', () => {
    expect(buildCoachSystem('uk', TODAY, HABIT_DATA)).toEqual([
      {
        type: 'text',
        text: COACH_INSTRUCTIONS,
        cache_control: { type: 'ephemeral' },
      },
      { type: 'text', text: coachRequestContext('uk', TODAY, HABIT_DATA) },
    ]);
  });
});
