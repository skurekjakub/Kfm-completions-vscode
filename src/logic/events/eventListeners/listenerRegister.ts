import * as vscode from 'vscode';

import { configChangeDisposable } from "./configFile/configChange";
import { changeDocDisposable } from './document/changeTextDocument';
import { changeActiveEditorDisposable } from './textEditor/changeActiveEditor';
import { changeVisibleEditorsDisposable } from './textEditor/changeVisibleEditor';
import { textEditorselectionChangeDisposable } from './textEditor/textEditorSelectionChange';

export const registerEventListeners = async (context: vscode.ExtensionContext): Promise<void> => {
  // registers document event listeners
  context.subscriptions.push(
    configChangeDisposable,
    changeDocDisposable,
    changeActiveEditorDisposable,
    changeVisibleEditorsDisposable,
    textEditorselectionChangeDisposable
  );
};