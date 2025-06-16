import * as vscode from 'vscode';

import { KFM_SETTINGS_SECTION } from '../../../../resources/settingsConsts';
import { fireEvent } from '../../internalEventEmitter';

export let configChangeDisposable = vscode.workspace.onDidChangeConfiguration(async (event: vscode.ConfigurationChangeEvent) => {
  if (event.affectsConfiguration(`${KFM_SETTINGS_SECTION}`)) {
    fireEvent('configChanged', event);
  }
});