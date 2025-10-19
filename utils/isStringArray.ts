export const isStringArray = (list: unknown): list is string[] => {
  return (
    Array.isArray(list) &&
    list.filter((file) => typeof file !== 'string').length === 0
  );
};
