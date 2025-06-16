// logic/diagnosticTrigger.ts
import * as vscode from 'vscode';

import { DiagnosticUpdateFunction } from './types';
import { allowedDiagnosticPaths } from '../filesystem/workspaceFileLoader';

// Timer map specific to this module
export const diagnosticDebounceTimers = new Map<string, NodeJS.Timeout>(); // Exported for cleanup
const DIAGNOSTIC_DEBOUNCE_DELAY = 250; // Delay specific to diagnostics

// --- Add Options type ---
type TriggerOptions = {
    immediate?: boolean;
};

/**
 * Triggers a debounced update for a specific diagnostic function.
 *
 * @param editor The text editor to run diagnostics on.
 * @param diagnosticFunction The specific function to call to update diagnostics (e.g., updateCardDiagnostics).
 * @param diagnosticType A unique key for this type of diagnostic (optional, for more granular debouncing if needed later)
 */
export function triggerDiagnosticUpdate(
    editor: vscode.TextEditor | undefined,
    diagnosticFunction: DiagnosticUpdateFunction | undefined,
    diagnosticType: string = 'default', // Optional key for future use
    options: TriggerOptions = {}
) {
    // Need editor, collection, and the function to call
    if (!editor || !diagnosticFunction) {
        return;
    }
    
    const docPath = editor.document.uri.fsPath;
    // Only proceed if the path is in the allowed set OR if the set is empty (maybe still loading?)
    // Strict check: If you ONLY want diagnostics after loading is complete, remove `allowedDiagnosticPaths.size === 0`
    if (allowedDiagnosticPaths.size > 0 && !allowedDiagnosticPaths.has(docPath)) {
        return; // Path not allowed, stop here.
    }

    // Use a composite key if type is provided, otherwise just URI
    const docUriString = editor.document.uri.toString();
    const timerKey = `${docUriString}#${diagnosticType}`;
    
    if (options.immediate) {
        console.log(`Running IMMEDIATE diagnostic update (type: ${diagnosticType})...`);
        // Clear any pending debounced timer for the same key
        const existingTimer = diagnosticDebounceTimers.get(timerKey);
        if (existingTimer) {
            clearTimeout(existingTimer);
            diagnosticDebounceTimers.delete(timerKey);
        }
        // Run directly
        try {
             diagnosticFunction(editor);
        } catch(e) {
             console.error(`Error during immediate diagnostic update (${diagnosticType}):`, e);
        }
        return; // Don't proceed to set timeout
    }

    const existingTimer = diagnosticDebounceTimers.get(timerKey);
    if (existingTimer) { clearTimeout(existingTimer); }

    const newTimer = setTimeout(() => {
        const currentEditor = vscode.window.visibleTextEditors.find(e => e.document.uri.toString() === docUriString);
        if (currentEditor) {
            console.log(`Running debounced diagnostic update (type: ${diagnosticType})...`);
            diagnosticFunction(currentEditor);
        }
        diagnosticDebounceTimers.delete(timerKey);
    }, DIAGNOSTIC_DEBOUNCE_DELAY);

    diagnosticDebounceTimers.set(timerKey, newTimer);
}

/**
 * Clears a specific diagnostic debounce timer, e.g., when a document is closed.
 * @param documentUri The URI of the document whose timer should be cleared.
 */
export function clearDiagnosticTimer(documentUri: vscode.Uri): void {
    const docUriString = documentUri.toString();
    const existingTimer = diagnosticDebounceTimers.get(docUriString);
    if (existingTimer) {
        clearTimeout(existingTimer);
        diagnosticDebounceTimers.delete(docUriString);
    }
}

/**
 * Clears all diagnostic debounce timers, e.g., during extension deactivation.
 */
export function clearAllDiagnosticTimers(): void {
    diagnosticDebounceTimers.forEach(timer => clearTimeout(timer));
    diagnosticDebounceTimers.clear();
    console.log('Cleared all diagnostic debounce timers.');
}
