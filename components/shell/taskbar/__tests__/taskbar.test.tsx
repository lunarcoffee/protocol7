import { DateTime } from 'luxon';

import { render } from '@/utils/tests/renderSystemContext';

import { Taskbar } from '../Taskbar';

jest.mock('/hooks/useCurrentTime', () => ({
  // should be rendered the same in any locale
  useCurrentTime: () =>
    DateTime.fromFormat('08/17/2010', 'MM/dd/yyyy') as DateTime<true>,
}));

describe('taskbar', () => {
  it('renders correctly with no windows', () => {
    const { asFragment } = render(<Taskbar />);
    expect(asFragment()).toMatchSnapshot();
  });
});
