import * as vscode from 'vscode';
import { getCollection, pageFileHeaders, loadFileByIdentifier } from '../../../../logic/filesystem/workspaceFileLoader';

export const getPageLinkCompletions = async (document: vscode.TextDocument, includeCollection: boolean = true): Promise<vscode.CompletionItem[]> => {
    const pageIdCompletions: vscode.CompletionItem[] = [];

    for (const header of pageFileHeaders) {
        if (header.identifier === undefined) {continue;}
        const completion = new vscode.CompletionItem(`${header.title}--${header.identifier} (${header.collection})`, vscode.CompletionItemKind.Enum);
        completion.insertText = `${header.identifier}${getCollectionText(header.collectionId, document.uri, includeCollection)}`;
        completion.preselect = true;
        completion.sortText = 'AAtcmplPgLnk';
        pageIdCompletions.push(completion);
    }
    return pageIdCompletions;
};

const getCollectionText = (headerCollectionId: string, uri: vscode.Uri, includeCollection: boolean) => {
    console.log(`${headerCollectionId}  ${getCollection(uri).collectionId}`);
    if (getCollection(uri).collectionId === headerCollectionId) {
        return '';
    } else if (includeCollection) {
        return ` collection="${headerCollectionId}"`;
    } else {
        return '';
    }
};

export const getAnchorCompletions = async (pageId: string): Promise<vscode.CompletionItem[]> => {
    const cmpls: vscode.CompletionItem[] = [];
    if (pageId) {
        const targetPage = await loadFileByIdentifier(pageId);
        if (targetPage) {
            const headings = targetPage.matchAll(/^#+\s+(.*)$/gm);
            if (headings) {
                for (const heading of headings) {
                    let cmpl = new vscode.CompletionItem(`${heading[1].replaceAll(/\s*\{%.*%\}\s*/g, '').trim()}`, vscode.CompletionItemKind.Enum);
                    cmpl.preselect = true;
                    cmpl.sortText = "AtcmplMdTitle";
                    cmpls.push(cmpl);
                }
            }
        }
    }

    return cmpls;
};