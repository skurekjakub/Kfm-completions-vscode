import * as vscode from 'vscode';

// Define a type for the functions that will perform diagnostic updates
export type DiagnosticUpdateFunction = (editor: vscode.TextEditor) => void;