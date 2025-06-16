import * as vscode from 'vscode';

import { fireEvent } from '../../internalEventEmitter';
import { MARKDOWN } from '../../../../constants';

export const changeVisibleEditorsDisposable = vscode.window.onDidChangeVisibleTextEditors(editors => {
  // Fire the event for each newly visible editor that is relevant
  editors.forEach((editor) => {
      if (editor && editor.document.languageId === MARKDOWN) {
          fireEvent('editorChanged', editor);
      }
  });
});