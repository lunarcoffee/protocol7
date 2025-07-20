import { useState } from 'react';

export const useBoolean = (
  initialValue: boolean = false,
): [boolean, () => void, () => void] => {
  const [value, setValue] = useState(initialValue);

  return [value, () => setValue(true), () => setValue(false)];
};
