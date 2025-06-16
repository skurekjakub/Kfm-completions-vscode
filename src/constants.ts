export const LANGS: string[] = ['csharp','cshtml','html', 'css', 'js', 'json', 'graphql', 'ts', 'tsx', 'jsx', 'yaml', 'bicep', 'powershell', 'xml', 'regex', 'nginx', 'git', 'liquid', 'markdown',];

export const MARKDOWN = 'markdown';

// line hightlight cosntants
export const CODE_START_REGEX = /^\s*\{% code .*?%\}\s*$/;
export const CODE_END_REGEX = /^\s*\{% endcode %\}\s*$/;
// Regex to extract the highlight parameter value
export const HIGHLIGHT_PARAM_REGEX = /highlight=([^%\s]+)/;

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

export enum TagNames {
    // links
    PAGE_LINK = 'page_link',
    INPAGE_LINK = 'inpage_link',
    BUTTON_LINK = 'button_link',
    EXTERNAL_LINK = 'external_link',
    // files
    ICON = 'icon',
    STATUS = 'status',
    IMAGE = 'image',
    FILE = 'file',
    VIDEO = 'video',
    TOC = 'toc',
    // pair
    CODE = 'code',
    CARD = 'card',
    RAW = 'raw',
    PAGE_TREE = 'page_tree',
    PANEL = 'panel',
    // adminotions
    NOTE = 'note',
    WARNING = 'warning',
    INFO = 'info',
    TIP = 'tip',
    BANNER = 'banner',
    // tables
    GRID = 'grid',
    TABLE = 'table',
    ROW = 'row',
    CELL = 'cell',
    GRID_ITEM = 'grid_item'
}
