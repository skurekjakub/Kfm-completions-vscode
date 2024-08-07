export const LANGS: string[] = ['csharp','cshtml','html', 'css', 'js', 'json', 'graphql', 'ts', 'tsx', 'jsx', 'yaml', 'bicep', 'powershell', 'xml', 'regex', 'nginx', 'git', 'liquid', 'markdown',];

export const MARKDOWN = 'markdown';
export const XP_DOCUMENTATION_FILES = `**/src/_documentation/_xp/**`;
export const TUTORIAL_DOCUMENTATION_FILES = `**/src/_documentation/_api/**`;
export const API_DOCUMENTATION_FILES = `**/src/_documentation/_tutorial/**`;
export const XP_ICON_DEFINITIONS = '**/src/_assets/less/**/xp-icon-variables.less';
export const LICENSE_TIER_DEFINITIONS = '**/resources/license-tier-map.json';

export const NEWLINE = '\n';

export enum Scope {
    Text = 0,
    Tag = 1,
    TagParam = 2
};
 
export const SYMBOLS = {
    TAG_OPEN: '{%',
    TAG_CLOSE: '%}'
};

export const TAG_NAMES = {
    PAGE_LINK: 'page_link',
    INPAGE_LINK: 'inpage_link',
    ICON: 'icon',
    IMAGE: 'image',
    FILE: 'file',
    VIDEO: 'video',
    CODE: 'code'
};