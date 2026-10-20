export const toDataPath = (filePath: string): string =>
    filePath.replaceAll(/(?<!^)\//g, '.data/').replace(/(?<!\/)$/, '.data');

export const toMetadataPath = (filePath: string): string => toDataPath(filePath).replace(/\.data\/?$/, '.metadata');

// path expected by the client (without .data or .metadata extensions)
export const toClientPath = (filePath: string): string => filePath.replaceAll(/\.(data|metadata)(?:\/|$)/g, '');
