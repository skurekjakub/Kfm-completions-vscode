import * as vscode from 'vscode';

import { fireEvent } from '../../internalEventEmitter';
import { MARKDOWN } from '../../../../constants';

export const changeActiveEditorDisposable = vscode.window.onDidChangeActiveTextEditor((editor) => {
    // Fire the internal event, passing the new active editor (which can be undefined)
    // Only fire if it's a markdown file or undefined (when switching away)
    if (!editor || editor.document.languageId === MARKDOWN) {
         fireEvent('editorChanged', editor);
    }
});