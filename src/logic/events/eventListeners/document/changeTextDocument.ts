import * as vscode from 'vscode';

import { fireEvent } from '../../internalEventEmitter';

export const changeDocDisposable = vscode.workspace.onDidChangeTextDocument(event => {
    // If the change is empty, ignore it (e.g., formatting doesn't change text)
    if (event.contentChanges.length === 0) {
        return;
    }

    // Identify the relevant editor, if any is active/visible for this document
    const activeEditor = vscode.window.activeTextEditor;
    let targetEditor: vscode.TextEditor | undefined = undefined;

    if (activeEditor && event.document === activeEditor.document) {
        targetEditor = activeEditor;
    } else {
        targetEditor = vscode.window.visibleTextEditors.find(e => e.document === event.document);
    }

    // Fire the internal event, passing the document and the associated editor (if found)
    fireEvent('documentChanged', { document: event.document, editor: targetEditor });
});
