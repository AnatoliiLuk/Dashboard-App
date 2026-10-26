import { describe, expect, it, jest } from '@jest/globals';
import { screen } from '@testing-library/react';

import { CoachMessage } from './CoachMessage';
import { renderWithProviders } from '../../test/render';

describe('CoachMessage', () => {
  it('labels the person and the coach', () => {
    renderWithProviders(
      <ul>
        <CoachMessage
          entry={{ id: 1, role: 'user', content: 'How is my streak?' }}
          onAcceptProposal={jest.fn(async () => undefined)}
        />
        <CoachMessage
          entry={{
            id: 2,
            role: 'assistant',
            content: 'Seven days in a row.',
            truncated: false,
            proposal: null,
          }}
          onAcceptProposal={jest.fn(async () => undefined)}
        />
      </ul>,
    );

    expect(screen.getByText('You')).toBeInTheDocument();
    expect(screen.getByText('Coach')).toBeInTheDocument();
    expect(screen.getByText('Seven days in a row.')).toBeInTheDocument();
    expect(
      screen.queryByRole('region', { name: 'Suggested habit' }),
    ).not.toBeInTheDocument();
  });

  it('shows a proposal card and a note when the reply was cut short', () => {
    renderWithProviders(
      <ul>
        <CoachMessage
          entry={{
            id: 1,
            role: 'assistant',
            content: 'Try a short walk.',
            truncated: true,
            proposal: { name: 'Walk', color: 'green', reason: 'Easy start.' },
          }}
          onAcceptProposal={jest.fn(async () => undefined)}
        />
      </ul>,
    );

    expect(screen.getByText('This answer was cut short.')).toBeInTheDocument();
    expect(
      screen.getByRole('region', { name: 'Suggested habit' }),
    ).toHaveTextContent('Walk');
  });
});
