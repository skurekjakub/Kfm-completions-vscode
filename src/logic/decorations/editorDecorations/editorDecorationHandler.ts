import * as vscode from 'vscode';
import { MARKDOWN } from '../../../constants';
// Import the specific decoration function(s) this handler manages
import { updateCurrentLineDecoration } from './currentLineDecoration';

/**
 * Central handler to update all decorations that depend on the editor's state
 * (e.g., selection, cursor position) rather than just the document content.
 *
 * @async Potentially async if future decoration functions are async.
 * @param {vscode.TextEditor} editor - The active text editor to update decorations for.
 * @returns {Promise<void>}
 */
export async function updateEditorDecorations(editor: vscode.TextEditor): Promise<void> {
    // Basic validation
    if (!editor || editor.document.languageId !== MARKDOWN) {
        return;
    }

    const documentUri = editor.document.uri;
    console.log(`[updateEditorDecorations] Running for: ${documentUri.fsPath}`);

    try {
        // --- Call individual editor decoration functions ---

        // 1. Update the relative line number hint
        updateCurrentLineDecoration(editor);

        // 2. Add calls to other editor-state decoration functions here in the future
        // e.g., updateVisibleRangeHighlight(editor);
        // e.g., updateCursorContextDecoration(editor);

        // --- End of calls ---

    } catch (error) {
        console.error(`[updateEditorDecorations] Error during update for ${documentUri.fsPath}:`, error);
    }

    console.log(`[updateEditorDecorations] Finished for: ${documentUri.fsPath}`);
}
