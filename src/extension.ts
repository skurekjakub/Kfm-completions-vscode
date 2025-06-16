import * as vscode from 'vscode';
import { disposeAll } from './logic/lifecycle/pluginDispose';
import { initPlugin } from './logic/lifecycle/pluginInit';

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export async function activate(context: vscode.ExtensionContext) {
    await initPlugin(context);

	vscode.window.showInformationMessage('Kentico autocompletions loaded.');
}

// Called when extension deactivated (vscode close or manually via plugin panel)
export async function deactivate() {
	console.log('Deactivating extension.');

    disposeAll();
}
