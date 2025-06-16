import * as vscode from 'vscode';

import { decorationManager } from '../decorationTypeManager';
import {
    CODEBLOCK_HIGHLIGHT_LINENUMBER_HINTS_NAME,
    CODEBLOCK_HIGHLIGHT_LINENUMBER_HINTS_SETTING_DEFAULT,
    CODEBLOCK_HIGHLIGHT_SUBSECTION,
    KFM_SETTINGS_SECTION
} from '../../../resources/settingsConsts'; // Adjust path if needed

import { CODE_START_REGEX, CODE_END_REGEX } from '../../../constants';

/**
 * Updates the decoration showing the relative line number hint for the CURRENT cursor line,
 * only if it's inside a code block and the setting is enabled.
 *
 * @export
 * @param {(vscode.TextEditor | undefined)} editor - The editor to update.
 */
export function updateCurrentLineDecoration(editor: vscode.TextEditor | undefined): void {
    // Get the decoration type for the relative line hint
    let currentRelativeLineType: vscode.TextEditorDecorationType | undefined;
    try {
        currentRelativeLineType = decorationManager.getTypeByName('relativeLineHint');
    } catch (e) {
        console.error("[updateCurrentLineDecoration] Failed to get relative line type:", e);
        return; // Cannot proceed without the type
    }

    if (!editor || !currentRelativeLineType) {
        return;
    }

    // Check if the feature is enabled via settings
    const config = vscode.workspace.getConfiguration(`${KFM_SETTINGS_SECTION}.${CODEBLOCK_HIGHLIGHT_SUBSECTION}`);
    const isEnabled = config.get<boolean>(`${CODEBLOCK_HIGHLIGHT_LINENUMBER_HINTS_NAME}`, CODEBLOCK_HIGHLIGHT_LINENUMBER_HINTS_SETTING_DEFAULT);

    if (!isEnabled) {
        // If disabled, clear any existing decorations of this type and exit
        editor.setDecorations(currentRelativeLineType, []);
        return;
    }

    const document = editor.document;
    const currentLineIndex = editor.selection.active.line; // 0-based cursor line
    let decorationOptions: vscode.DecorationOptions[] = []; // Default to empty (clears old)

    let enclosingStartLine = -1;
    let enclosingEndLine = -1;

    // --- Find Enclosing Code Block ---
    // Search backwards for the start tag {% code ... %}
    for (let i = currentLineIndex; i >= 0; i--) {
        // Need to handle potential errors accessing lines outside valid range, though unlikely here
        try {
            if (CODE_START_REGEX.test(document.lineAt(i).text)) {
                enclosingStartLine = i;
                break;
            }
            // Optimization: Stop searching backwards if we hit an end tag on a previous line?
            if (i < currentLineIndex && CODE_END_REGEX.test(document.lineAt(i).text)) {
                break; // Likely means cursor is outside or after a block
            }
        } catch (e) { break; } // Stop if line index is invalid
    }

    // If a start tag was found, search forwards for the end tag {% endcode %}
    if (enclosingStartLine !== -1) {
        for (let i = enclosingStartLine + 1; i < document.lineCount; i++) {
            try {
                if (CODE_END_REGEX.test(document.lineAt(i).text)) {
                    enclosingEndLine = i;
                    break;
                }
                // Optimization: Stop searching forwards if we hit another start tag?
                if (CODE_START_REGEX.test(document.lineAt(i).text)) {
                    break; // Likely means the original block was unclosed or nested (unsupported?)
                }
            } catch (e) { break; } // Stop if line index is invalid
        }
    }
    // --- End of Finding Enclosing Code Block ---


    // --- Apply Decoration ONLY if strictly inside a block ---
    if (enclosingStartLine !== -1 && enclosingEndLine !== -1 &&
        currentLineIndex > enclosingStartLine && currentLineIndex < enclosingEndLine) {
        const relativeLine = currentLineIndex - enclosingStartLine;
        // Place the decoration at the end of the current line
        const lineEndPosition = document.lineAt(currentLineIndex).range.end;
        const range = new vscode.Range(lineEndPosition, lineEndPosition); // Zero-width range at line end

        // Define the decoration content using renderOptions
        decorationOptions = [{
            range: range,
            renderOptions: {
                after: { // Render content *after* the range
                    contentText: ` (Ln ${relativeLine})`, // Display relative line number
                    // Style properties are inherited from the TextEditorDecorationType definition
                    // in decorationManager, but can be overridden here if needed.
                    // e.g., color: 'grey', fontStyle: 'italic'
                }
            }
        }];
    }

    // Apply the single decoration (or clear if array is empty)
    editor.setDecorations(currentRelativeLineType, decorationOptions);
}

// Removed parseHighlightString function as it was moved to codeDecorations.ts
