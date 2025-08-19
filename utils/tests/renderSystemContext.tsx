import { render, RenderOptions } from '@testing-library/react';
import { ReactElement } from 'react';

import { SystemContextProvider } from '@/components/contexts/system/SystemContext';

const renderSystemContext = (
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>,
) => render(ui, { ...options, wrapper: SystemContextProvider });

export { renderSystemContext as render };
