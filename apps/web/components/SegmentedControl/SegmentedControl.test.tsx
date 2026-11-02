import { describe, expect, it, jest } from '@jest/globals';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { SegmentedControl } from './SegmentedControl';
import { renderWithProviders } from '../../test/render';

const options = [
  { id: 'newest', label: 'Newest' },
  { id: 'oldest', label: 'Oldest' },
] as const;

function renderControl(onChange = jest.fn()) {
  renderWithProviders(
    <SegmentedControl
      label="Sort by"
      value="newest"
      options={options}
      onChange={onChange}
      action={<button type="button">Archive (1)</button>}
    />,
  );
  return onChange;
}

describe('SegmentedControl', () => {
  it('marks the current option in the segmented group', () => {
    renderControl();

    expect(screen.getByRole('button', { name: 'Newest' })).toHaveAttribute(
      'aria-pressed',
      'true',
    );
  });

  it('offers the same choice as a picker for phones', async () => {
    const user = userEvent.setup();
    const onChange = renderControl();

    const picker = screen.getByRole('combobox', { name: 'Sort by:' });
    expect(picker).toHaveValue('newest');

    await user.selectOptions(picker, 'Oldest');

    expect(onChange).toHaveBeenCalledWith('oldest');
  });

  it('keeps the action next to the options', () => {
    renderControl();

    expect(
      screen.getByRole('button', { name: 'Archive (1)' }),
    ).toBeInTheDocument();
  });
});
