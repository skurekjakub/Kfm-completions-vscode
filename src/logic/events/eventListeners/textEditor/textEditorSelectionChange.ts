import * as vscode from 'vscode';

import { fireEvent } from '../../internalEventEmitter';
import { MARKDOWN } from '../../../../constants';

export const textEditorselectionChangeDisposable = vscode.window.onDidChangeTextEditorSelection(event => {
  // Fire the internal event, passing the full event args
  // Only fire if the editor is a markdown file
  if (event.textEditor.document.languageId === MARKDOWN) {
    fireEvent('selectionChanged', event);
  }
});