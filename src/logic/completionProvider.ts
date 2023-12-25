import { CompletionItem, CompletionItemKind, SnippetString, MarkdownString } from "vscode";
import { LANGS } from "./constants";
import { completions as pageLinkCompletions, iconCompletions } from "./workspaceFileLoader";

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

export const getPageLinkCompletions = () => {
    return pageLinkCompletions;
}

export const getIconCompletions = () => {
	return iconCompletions
}

export const getSnippetCompletions = (): CompletionItem[] => {
    const pagelinkCompletion = new CompletionItem('page_link');
    pagelinkCompletion.insertText = new SnippetString('{% page_link $1${2: linkText=\"${3:(optional)}\"} %} $0');
    pagelinkCompletion.documentation = new MarkdownString("Inserts a snippet that lets you link.");
    pagelinkCompletion.preselect = true;
    pagelinkCompletion.sortText = 'AtcmplSnippet';
    
    const inPagelinkCompletion = new CompletionItem('inpage_link');
    inPagelinkCompletion.insertText = new SnippetString('{% inpage_link $1${2: linkText=\"${3:(optional)}\"} %} $0');
    inPagelinkCompletion.documentation = new MarkdownString("Inserts a snippet that lets you link to an anchor on the current page.");
    inPagelinkCompletion.preselect = true;
    inPagelinkCompletion.sortText = 'AtcmplSnippet';

    const codeCompletion = new CompletionItem('code_tag');
    codeCompletion.insertText = new SnippetString('{% code lang=${1|'+`${LANGS.join(',')}`+'|} title=\"$2\"${3: linenumbers=true} %}\r\n$0\r\n{% endcode %}\r\n\r\n');
    codeCompletion.documentation = new MarkdownString("Inserts a snippet that lets you link to an anchor on the current page.");
    codeCompletion.preselect = true;
    codeCompletion.sortText = 'AtcmplSnippet';

    const imageCompletion = new CompletionItem('image_tag');
    imageCompletion.insertText = new SnippetString('{% image $1 title="$2" width="$3"}${4: border=true} %}');
    imageCompletion.documentation = new MarkdownString("Inserts image tag snippet.");
    imageCompletion.preselect = true;
    imageCompletion.sortText = 'AtcmplSnippet';

    const fileCompletion = new CompletionItem('file_tag');
    fileCompletion.insertText = new SnippetString('{% file $1 disposition="${2:download} %}"');
    fileCompletion.documentation = new MarkdownString("Inserts file tag snippet.");
    fileCompletion.preselect = true;
    fileCompletion.sortText = 'AtcmplSnippet';

    const videoCompletion = new CompletionItem('video_tag');
    videoCompletion.insertText = new SnippetString('{% video $1${2: width="$3"}${4: height="$"} %}"');
    videoCompletion.documentation = new MarkdownString("Inserts file tag snippet.");
    videoCompletion.preselect = true;
    videoCompletion.sortText = 'AtcmplSnippet';

    const noteCompletion = new CompletionItem('note_tag');
    noteCompletion.insertText = new SnippetString('{% note${1: icon=false} %}\r\n$0\r\n{% endnote %}');
    noteCompletion.documentation = new MarkdownString("Inserts note admonition snippet.");
    noteCompletion.preselect = true;
    noteCompletion.sortText = 'AtcmplSnippet';

    const infoCompletion = new CompletionItem('info_tag');
    infoCompletion.insertText = new SnippetString('{% info${1: icon=false} %}\r\n$0\r\n{% endinfo %}');
    infoCompletion.documentation = new MarkdownString("Inserts info admonition snippet.");
    infoCompletion.preselect = true;
    infoCompletion.sortText = 'AtcmplSnippet';

    const warningCompletion = new CompletionItem('warning_tag');
    warningCompletion.insertText = new SnippetString('{% warning${1: icon=false} %}\r\n$0\r\n{% endwarning %}');
    warningCompletion.documentation = new MarkdownString("Inserts warning admonition snippet.");
    warningCompletion.preselect = true;
    warningCompletion.sortText = 'AtcmplSnippet';

    const tipCompletion = new CompletionItem('tip_tag');
    tipCompletion.insertText = new SnippetString('{% tip${1: icon=false} %}\r\n$0\r\n{% endtip %}');
    tipCompletion.documentation = new MarkdownString("Inserts tip admonition snippet.");
    tipCompletion.preselect = true;
    tipCompletion.sortText = 'AtcmplSnippet';
    
    return [
        pagelinkCompletion,
        inPagelinkCompletion,
        codeCompletion,
        imageCompletion,
        fileCompletion,
        videoCompletion,
        noteCompletion,
        infoCompletion,
        warningCompletion,
        tipCompletion
    ]
}