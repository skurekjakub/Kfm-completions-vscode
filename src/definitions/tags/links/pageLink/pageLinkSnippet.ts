import { CompletionItem, SnippetString, MarkdownString } from "vscode";
import { TagNames } from "../../../../constants";
import { SnippetProviderFn } from "../../types";

export const pagelinkCompletion: SnippetProviderFn = async (): Promise<CompletionItem> => {
    const pagelink = new CompletionItem(TagNames.PAGE_LINK);
    pagelink.insertText = new SnippetString('{% ' + `${TagNames.PAGE_LINK}` + ' $1${2: linkText=\"${TM_SELECTED_TEXT}\" %}} $0');
    pagelink.documentation = new MarkdownString("Inserts a tag that lets you link to different page.");
    pagelink.preselect = true;
    pagelink.sortText = 'AtcmplAPageLinkSnippet';

    return pagelink;
};