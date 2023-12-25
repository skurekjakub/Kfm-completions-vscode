// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';

import { loadXpMdFiles, loadXpIcons } from './logic/workspaceFileLoader';
import { registerCompletions } from './logic/completionRegister';

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export async function activate(context: vscode.ExtensionContext) {
	await loadXpMdFiles();
	await loadXpIcons();

	await registerCompletions(context);

	vscode.window.showInformationMessage('Autocompletions for XP loaded.');
}

// This method is called when your extension is deactivated
export function deactivate() {}
