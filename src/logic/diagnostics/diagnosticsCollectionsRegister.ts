import * as vscode from 'vscode';

import { headerDiagnosticsCollection } from './header/headerDiagnosticsHandler'; // [cite: 1]
import { tagDiagnosticsCollection } from './tags/tagDiagnosticsHandler';

export const initDiagnostics = async (context: vscode.ExtensionContext): Promise<void> => {
  // add diagnostics collection for card
  context.subscriptions.push(
    headerDiagnosticsCollection,
    tagDiagnosticsCollection
  );
};