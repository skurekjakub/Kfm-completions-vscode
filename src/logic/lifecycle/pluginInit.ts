import * as vscode from 'vscode';

import { initCompletions } from '../completions/completionRegister';
import { initDiagnostics } from '../diagnostics/diagnosticsCollectionsRegister';
import { initEventHandling } from '../events/init';
import { loadXpIcons, loadXpMdFiles } from '../filesystem/workspaceFileLoader';
import { decorationManager } from '../decorations/decorationTypeManager';
import { subscribeEvents } from '../eventSubscriber';
import { fireEvent } from '../events/internalEventEmitter';

export const initPlugin = async (context: vscode.ExtensionContext) => {

  // inits the plugin
  await initCompletions(context);

  // register diagnostics
  await initDiagnostics(context);

  // register event triggers and listeners
  await initEventHandling(context);

  // loads workspace files
  await loadXpMdFiles();
  await loadXpIcons();

  // this should probably be elsewhere
  decorationManager.initialize();

  await subscribeEvents(context);

  setTimeout(() => {
    fireEvent('activationComplete', undefined);
    console.log("'activationComplete' event fired via setTimeout.");
  }, 0);
};
