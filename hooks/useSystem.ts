import { use } from 'react';

import {
  System,
  SystemContext,
  SystemDispatch,
  SystemDispatchContext,
} from '@/components/contexts/system/SystemContext';

export const useSystem = (): [System, SystemDispatch] => [
  use(SystemContext),
  use(SystemDispatchContext),
];
