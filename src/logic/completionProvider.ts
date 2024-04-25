import { CompletionItem, CompletionItemKind, SnippetString, MarkdownString, Uri, TextEdit } from "vscode";
import { LANGS, TAG_NAMES } from "./constants";
import { pageFileHeaders, iconCompletions, getCollection } from "./workspaceFileLoader";

import { TextDocument } from "vscode";

export const getInpageLinkCompletions = (document: string) => {
    const inpagecompletions: CompletionItem[] = []
    const headings = document.matchAll(/^#+\s+(.*)$/gm)
    for (const heading of headings) {
        let cmpl = new CompletionItem(`"${heading[1].replaceAll(/\{%.*%\}/g, '')}"`, CompletionItemKind.Enum)
        cmpl.preselect = true
        cmpl.sortText = "AtcmplMdTitle"
        inpagecompletions.push(cmpl)
    }

    return inpagecompletions;
}

export const getPageLinkCompletions = (document: TextDocument) => {
    const pageIdCompletions: CompletionItem[] = []

    for (const header of pageFileHeaders) {
        const completion = new CompletionItem(`${header.title}--${header.identifier} (${header.collection})`, CompletionItemKind.Enum);
        completion.insertText = `${header.identifier}${getCollectionText(header.collection, document.uri)}`;
        completion.preselect = true;
        completion.sortText = 'AtcmplPgLnk';
        pageIdCompletions.push(completion);
    }
    return pageIdCompletions;
}

function getCollectionText(headerCollection: string, uri: Uri) {
    if (getCollection(uri) === headerCollection) {
        return '';
    } else {
        return ` collection="${headerCollection}"`;
    };
}

export const getIconCompletions = () => {
	return iconCompletions;
}

export const getSnippetCompletions = (): CompletionItem[] => {
    const pagelinkCompletion = new CompletionItem('page_link');
    pagelinkCompletion.insertText = new SnippetString('{% page_link $1${2: linkText=\"${TM_SELECTED_TEXT}\" %}} $0');
    pagelinkCompletion.documentation = new MarkdownString("Inserts a tag that lets you link to different page.");
    pagelinkCompletion.preselect = true;
    pagelinkCompletion.sortText = 'AtcmplSnippet';
    
    const inPagelinkCompletion = new CompletionItem('inpage_link');
    inPagelinkCompletion.insertText = new SnippetString('{% '+`${TAG_NAMES.INPAGE_LINK}`+' $1${2: linkText=\"${3:(optional)}\"} %} $0');
    inPagelinkCompletion.documentation = new MarkdownString("Inserts a tag that lets you link to an anchor on the current page.");
    inPagelinkCompletion.preselect = true;
    inPagelinkCompletion.sortText = 'AtcmplSnippet';

    const externalLinkCompletion = new CompletionItem('external_link');
    externalLinkCompletion.insertText = new SnippetString('{% ' + `external_link` + ' $1${2: linkText=\"${3:(optional)}\"} %} $0');
    externalLinkCompletion.documentation = new MarkdownString("Inserts a tag that lets you link to an external URL.");
    externalLinkCompletion.preselect = true;
    externalLinkCompletion.sortText = 'AtcmplSnippet';

    const codeCompletion = new CompletionItem('code_tag');
    codeCompletion.insertText = new SnippetString('{% '+`${TAG_NAMES.CODE}`+' lang=${1|'+`${LANGS.join(',')}`+'|} title=\"$2\" %}\r\n$0\r\n{% endcode %}\r\n\r\n');
    codeCompletion.documentation = new MarkdownString("Inserts a code tag snippet.");
    codeCompletion.preselect = true;
    codeCompletion.sortText = 'AtcmplSnippet';

    const imageCompletion = new CompletionItem('image_tag');
    imageCompletion.insertText = new SnippetString('{% image $1 title="$2" width="$3"${4: border=true} %}');
    imageCompletion.documentation = new MarkdownString("Inserts image tag snippet.");
    imageCompletion.preselect = true;
    imageCompletion.sortText = 'AtcmplSnippet';

    const fileCompletion = new CompletionItem('file_tag');
    fileCompletion.insertText = new SnippetString('{% file $1 disposition="${2:download} %}"');
    fileCompletion.documentation = new MarkdownString("Inserts file tag snippet.");
    fileCompletion.preselect = true;
    fileCompletion.sortText = 'AtcmplSnippet';

    const videoCompletion = new CompletionItem('video_tag');
    videoCompletion.insertText = new SnippetString('{% video $1${2: width="$3"}${4: height="$5"} %}"');
    videoCompletion.documentation = new MarkdownString("Inserts file tag snippet.");
    videoCompletion.preselect = true;
    videoCompletion.sortText = 'AtcmplSnippet';

    const noteCompletion = new CompletionItem('note_tag');
    noteCompletion.insertText = new SnippetString('{% note${1: icon=false} %}\n$0\n{% endnote %}');
    noteCompletion.documentation = new MarkdownString("Inserts note admonition snippet.");
    noteCompletion.preselect = true;
    noteCompletion.sortText = 'AtcmplSnippet';

    const infoCompletion = new CompletionItem('info_tag');
    infoCompletion.insertText = new SnippetString('{% info${1: icon=false} %}\n$0\n{% endinfo %}');
    infoCompletion.documentation = new MarkdownString("Inserts info admonition snippet.");
    infoCompletion.preselect = true;
    infoCompletion.sortText = 'AtcmplSnippet';

    const warningCompletion = new CompletionItem('warning_tag');
    warningCompletion.insertText = new SnippetString('{% warning${1: icon=false} %}\n$0\n{% endwarning %}');
    warningCompletion.documentation = new MarkdownString("Inserts warning admonition snippet.");
    warningCompletion.preselect = true;
    warningCompletion.sortText = 'AtcmplSnippet';

    const tipCompletion = new CompletionItem('tip_tag');
    tipCompletion.insertText = new SnippetString('{% tip${1: icon=false} %}\n$0\n{% endtip %}');
    tipCompletion.documentation = new MarkdownString("Inserts tip admonition snippet.");
    tipCompletion.preselect = true;
    tipCompletion.sortText = 'AtcmplSnippet';

    const tableCompletion = new CompletionItem('table_tag');
    tableCompletion.insertText = new SnippetString('{% table %}\n$0\n{% endtable %}');
    tableCompletion.documentation = new MarkdownString("Inserts table start/end.");
    tableCompletion.preselect = true;
    tableCompletion.sortText = 'AtcmplSnippet';

    const rowCompletion = new CompletionItem('row_tag');
    rowCompletion.insertText = new SnippetString('{% row ${1: header=\"${2:(true/false)}\"} %}\n$0\n{% endrow %}');
    rowCompletion.documentation = new MarkdownString("Inserts row start/end.");
    rowCompletion.preselect = true;
    rowCompletion.sortText = 'AtcmplSnippet';

    const cellCompletion = new CompletionItem('cell_tag');
    cellCompletion.insertText = new SnippetString('{% cell %}${TM_SELECTED_TEXT}$0\n{% endcell %}');
    cellCompletion.documentation = new MarkdownString("Inserts cell start/end.");
    cellCompletion.preselect = true;
    cellCompletion.sortText = 'AtcmplSnippet';

    const rawCompletion = new CompletionItem('raw_tag');
    rawCompletion.insertText = new SnippetString('{% raw %}${TM_SELECTED_TEXT}$0{% endraw %}');
    rawCompletion.documentation = new MarkdownString("Surrounds text with {% raw %}{% endraw %}.");
    rawCompletion.preselect = true;
    rawCompletion.sortText = 'AtcmplSnippet';

    const pageTreeCompletion = new CompletionItem('page_tree_tag');
    pageTreeCompletion.insertText = new SnippetString('{% page_tree %}$0');
    pageTreeCompletion.documentation = new MarkdownString("Renders a page tree rooted at the current page. Can only be used once per page.");
    pageTreeCompletion.preselect = true;
    pageTreeCompletion.sortText = 'AtcmplSnippet';

    const panelCompletion = new CompletionItem('panel_tag');
    panelCompletion.insertText = new SnippetString('{% panel %}\n$0\n{% endpanel %}');
    panelCompletion.documentation = new MarkdownString("Panel that highlights surrounded text.");
    panelCompletion.preselect = true;
    panelCompletion.sortText = 'AtcmplSnippet';

    const iconCompletion = new CompletionItem('icon_tag');
    iconCompletion.insertText = new SnippetString('{% icon $1 color="$2" %}');
    iconCompletion.documentation = new MarkdownString("Inserts an icon.");
    iconCompletion.preselect = true;
    iconCompletion.sortText = 'AtcmplSnippet';
    
    return [
        rawCompletion,
        pagelinkCompletion,
        inPagelinkCompletion,
        codeCompletion,
        imageCompletion,
        fileCompletion,
        videoCompletion,
        noteCompletion,
        infoCompletion,
        warningCompletion,
        tipCompletion,
        tableCompletion,
        rowCompletion,
        cellCompletion,
        externalLinkCompletion,
        pageTreeCompletion,
        panelCompletion,
        iconCompletion
    ]
}

