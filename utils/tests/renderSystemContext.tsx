import { render, RenderOptions } from '@testing-library/react';
import { ReactElement } from 'react';

import { SystemContextProviders } from '@/components/contexts/SystemContextProvider';

const renderSystemContext = (
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>,
) => render(ui, { ...options, wrapper: SystemContextProviders });

export { renderSystemContext as render };
