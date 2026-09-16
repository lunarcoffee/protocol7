import { withMetadata } from '.';

export const exists = async (filePath: string): Promise<boolean> =>
    withMetadata(
        filePath,
        ({ type }) => type !== 'deleted',
        () => true,
        () => false,
    );
