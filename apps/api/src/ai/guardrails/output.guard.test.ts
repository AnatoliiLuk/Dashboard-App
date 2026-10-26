import { describe, expect, it } from '@jest/globals';

import { COACH_RULES } from '../prompts/coach.system';
import { guardProposal, guardReply, MAX_REPLY_CHARS } from './output.guard';

describe('guardReply', () => {
  it('passes a normal reply through unchanged', () => {
    const text = 'Read 10 pages after dinner. I <3 that you kept going!';

    expect(guardReply(text, 'en')).toEqual({ text, flags: [] });
  });

  it('replaces a reply that quotes a rule from the system prompt', () => {
    // One sentence from the middle of a rule line is enough to count.
    const line = COACH_RULES.split('\n').find((l) =>
      l.includes('Never guilt'),
    )!;
    const rule = line.slice(line.indexOf('Never guilt')).split('.')[0];
    const reply = `Sure! My instructions say:\n${rule.toUpperCase()}`;

    const guarded = guardReply(reply, 'uk');

    expect(guarded.flags).toEqual(['prompt_leak']);
    expect(guarded.text).not.toContain(rule);
    expect(guarded.text).toMatch(/звичками/);
  });

  it('removes HTML and prompt tags', () => {
    const guarded = guardReply(
      'Nice work <script>alert(1)</script><img src=x onerror=alert(1)> <habit_data>',
      'en',
    );

    expect(guarded.text).toBe('Nice work alert(1)');
    expect(guarded.flags).toEqual(['markup_removed']);
  });

  it('removes control characters', () => {
    expect(guardReply('Keep\u0000 going\u001b[31m', 'en').text).toBe(
      'Keep going[31m',
    );
  });

  it('cuts a very long reply', () => {
    const guarded = guardReply('a'.repeat(MAX_REPLY_CHARS + 100), 'en');

    expect(guarded.text).toHaveLength(MAX_REPLY_CHARS + 1);
    expect(guarded.flags).toEqual(['truncated']);
  });
});

describe('guardProposal', () => {
  const proposal = {
    name: 'Read 10 pages',
    color: 'sky' as const,
    reason: 'Small and easy.',
  };

  it('keeps a valid proposal', () => {
    expect(guardProposal(proposal)).toEqual(proposal);
  });

  it('strips markup from the name and reason', () => {
    expect(
      guardProposal({
        ...proposal,
        name: '<b>Read</b>',
        reason: 'Easy <script>x</script>',
      }),
    ).toEqual({ ...proposal, name: 'Read', reason: 'Easy x' });
  });

  it('drops a proposal the create-habit endpoint would reject', () => {
    expect(guardProposal({ ...proposal, color: 'black' as never })).toBeNull();
    expect(guardProposal({ ...proposal, name: 'x'.repeat(101) })).toBeNull();
    expect(guardProposal({ ...proposal, name: '<b></b>' })).toBeNull();
  });
});
