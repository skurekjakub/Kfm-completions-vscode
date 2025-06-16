import * as vscode from 'vscode';

export const getInpageLinkCompletions = (document: vscode.TextDocument) => {
    const inpagecompletions: vscode.CompletionItem[] = [];
    const headings = document.getText().matchAll(/^#+\s+(.*)$/gm);
    for (const heading of headings) {
        let cmpl = new vscode.CompletionItem(`"${heading[1].replaceAll(/\{%.*%\}/g, '')}"`, vscode.CompletionItemKind.Enum);
        cmpl.preselect = true;
        cmpl.sortText = "AAAtcmplMdTitle";
        inpagecompletions.push(cmpl);
    }

    return inpagecompletions;
};
