import { describe, expect, it } from '@jest/globals';

import { COACH_EXAMPLES } from './coach.examples';
import { buildCoachSystemPrompt } from './coach.system';

const TODAY = '2026-10-23';

const SECTIONS = [
  'role',
  'scope',
  'tone',
  'honesty',
  'data_handling',
  'format',
  'examples',
  'language',
  'today',
];

describe('buildCoachSystemPrompt', () => {
  it('has every labelled section, in order', () => {
    const prompt = buildCoachSystemPrompt('en', TODAY);
    const positions = SECTIONS.map((name) => prompt.indexOf(`<${name}>`));

    expect(positions).not.toContain(-1);
    expect([...positions].sort((a, b) => a - b)).toEqual(positions);
    for (const name of SECTIONS) {
      expect(prompt).toContain(`</${name}>`);
    }
  });

  it('includes every few-shot example, with at least one in Ukrainian', () => {
    const prompt = buildCoachSystemPrompt('en', TODAY);

    for (const example of COACH_EXAMPLES) {
      expect(prompt).toContain(example.user);
      expect(prompt).toContain(example.coach);
    }
    expect(
      COACH_EXAMPLES.some(({ user }) => /[\u0400-\u04FF]/.test(user)),
    ).toBe(true);
  });

  it('names the app language for the given locale', () => {
    expect(buildCoachSystemPrompt('en', TODAY)).toContain('reply in English');
    expect(buildCoachSystemPrompt('uk', TODAY)).toContain('reply in Ukrainian');
  });

  it('keeps everything before the language section the same across locales', () => {
    const stablePart = (prompt: string) =>
      prompt.slice(0, prompt.indexOf('<language>'));

    expect(stablePart(buildCoachSystemPrompt('en', TODAY))).toBe(
      stablePart(buildCoachSystemPrompt('uk', TODAY)),
    );
  });

  it("ends with today's date", () => {
    expect(
      buildCoachSystemPrompt('en', TODAY).endsWith(`<today>${TODAY}</today>`),
    ).toBe(true);
  });
});
