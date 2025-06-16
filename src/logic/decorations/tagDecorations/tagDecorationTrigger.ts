import * as vscode from 'vscode';
import { updateTagDecorations } from './tagDecorationHandler';

/** Debounce delay in milliseconds for tag decoration updates. */
const DEBOUNCE_DELAY_MS = 250; // Using same delay as diagnostics for consistency

/** Map to store debounce timers, keyed by document URI string. */
const tagDecorationDebounceTimers = new Map<string, NodeJS.Timeout>();

/**
 * Triggers a debounced update of tag decorations for the given editor.
 * Ensures that decoration updates don't run excessively during typing.
 *
 * @async
 * @param {vscode.TextEditor | undefined} editor - The editor for which to trigger the update.
 * @returns {Promise<void>}
 */
export async function triggerTagDecorationUpdate(editor: vscode.TextEditor | undefined): Promise<void> {
    if (!editor) {
        console.log("[triggerTagDecorationUpdate] No editor provided, skipping.");
        return;
    }
    const docUriString = editor.document.uri.toString();

    // Clear existing timer for this document, if any
    const existingTimer = tagDecorationDebounceTimers.get(docUriString);
    if (existingTimer) {
        clearTimeout(existingTimer);
    }

    // Set a new timer
    const newTimer = setTimeout(async () => {
        // Ensure the editor associated with this document URI is still visible
        const currentEditor = vscode.window.visibleTextEditors.find(e => e.document.uri.toString() === docUriString);
        if (currentEditor) {
            console.log(`[triggerTagDecorationUpdate] Debounced execution for: ${docUriString}`);
            try {
                await updateTagDecorations(currentEditor);
            } catch (error) {
                console.error(`[triggerTagDecorationUpdate] Error during updateTagDecorations for ${docUriString}:`, error);
            }
        } else {
             console.log(`[triggerTagDecorationUpdate] Editor for ${docUriString} not visible anymore, skipping execution.`);
        }
        // Remove timer from map once done or skipped
        tagDecorationDebounceTimers.delete(docUriString);
    }, DEBOUNCE_DELAY_MS);

    // Store the new timer
    tagDecorationDebounceTimers.set(docUriString, newTimer);
}

/**
 * Clears all pending tag decoration debounce timers.
 * Should be called during extension deactivation.
 */
export function clearAllTagDecorationTimers(): void {
    console.log("[clearAllTagDecorationTimers] Clearing all pending timers.");
    tagDecorationDebounceTimers.forEach(timer => clearTimeout(timer));
    tagDecorationDebounceTimers.clear();
}
