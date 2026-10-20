export const escapeMarkdown = (str: string) => str.replace(/([\\`*_{}[\]()#+\-.!|])/g, '\\$1');
