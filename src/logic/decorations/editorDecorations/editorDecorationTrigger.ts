import * as vscode from 'vscode';
// Import the new central handler for editor-state decorations
import { updateEditorDecorations } from './editorDecorationHandler'; // Adjust path as needed

/** Debounce delay in milliseconds for general editor decoration updates. */
const DEBOUNCE_DELAY_MS = 100; // Keep delay relatively short for responsiveness (e.g., for selection changes)

/** Map to store debounce timers, keyed by document URI string. */
const editorDecorationDebounceTimers = new Map<string, NodeJS.Timeout>(); // Renamed map

/**
 * Triggers a debounced update of all editor-state dependent decorations
 * (e.g., relative line hint, cursor context highlights) for the given editor.
 * Calls the central updateEditorDecorations handler.
 *
 * @async Potentially async if the handler becomes async.
 * @param {vscode.TextEditor | undefined} editor - The editor for which to trigger the update.
 * @returns {Promise<void>}
 */
export async function triggerEditorDecorationUpdate(editor: vscode.TextEditor | undefined): Promise<void> { // Renamed function
    if (!editor) {
        return;
    }
    const docUriString = editor.document.uri.toString();

    // Clear existing timer
    const existingTimer = editorDecorationDebounceTimers.get(docUriString); // Use renamed map
    if (existingTimer) {
        clearTimeout(existingTimer);
    }

    // Set a new timer
    const newTimer = setTimeout(async () => { // Make inner function async to await handler
        // Re-find the editor
        const currentEditor = vscode.window.visibleTextEditors.find(e => e.document.uri.toString() === docUriString);
        if (currentEditor) {
            // Call the new central handler function
            try {
                console.log(`[triggerEditorDecorationUpdate] Debounced execution for: ${docUriString}`);
                await updateEditorDecorations(currentEditor); // Call the new handler
            } catch (error) {
                 console.error(`[triggerEditorDecorationUpdate] Error during updateEditorDecorations for ${docUriString}:`, error);
            }
        }
        editorDecorationDebounceTimers.delete(docUriString); // Use renamed map
    }, DEBOUNCE_DELAY_MS);

    editorDecorationDebounceTimers.set(docUriString, newTimer); // Use renamed map
}

/**
 * Clears all pending editor decoration debounce timers.
 * Should be called during extension deactivation.
 */
export function clearAllEditorDecorationTimers(): void { // Renamed function
    console.log("[clearAllEditorDecorationTimers] Clearing all pending timers."); // Updated log message
    editorDecorationDebounceTimers.forEach(timer => clearTimeout(timer)); // Use renamed map
    editorDecorationDebounceTimers.clear(); // Use renamed map
}
