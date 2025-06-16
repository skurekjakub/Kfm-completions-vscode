import * as vscode from 'vscode';

import { TagDecorationProviderFn } from '../../types';

// Regex to find the specific end tag for warning blocks
const WARNING_END_REGEX = /^\s*\{% endwarning %\}\s*$/;
// Maximum lines to search forward for the end tag to prevent performance issues
const MAX_SEARCH_LINES = 100;

/**
 * Generates decoration options to apply a style (e.g., border)
 * to the entire block enclosed by {% warning %} and {% endwarning %}.
 *
 * @param {Readonly<TagInstanceInfo>} tagInstance - Information about the specific {% warning %} or {% endwarning %} tag instance.
 * @param {vscode.TextDocument} document - The text document being processed.
 * @returns {vscode.DecorationOptions[] | undefined} An array containing one DecorationOptions object spanning the block, or undefined.
 */
export const getWarningBlockDecorations: TagDecorationProviderFn = (tagInstance, document) => {
    // Only apply the decoration based on the opening tag
    if (!tagInstance.isOpeningTag) {
        return undefined;
    }

    const startPosition = tagInstance.tagRange.start;
    let endPosition: vscode.Position | undefined = undefined;

    // Search forward for the matching {% endwarning %} tag
    let lineIndex = startPosition.line + 1;
    const searchLimit = Math.min(lineIndex + MAX_SEARCH_LINES, document.lineCount);

    while (lineIndex < searchLimit) {
        const line = document.lineAt(lineIndex);
        if (WARNING_END_REGEX.test(line.text)) {
            // Found the end tag, use its end position
            endPosition = line.range.end;
            break; // Stop searching
        }
        lineIndex++;
    }

    // If we found both start and end positions
    if (startPosition && endPosition) {
        // Create a range covering the entire block
        const blockRange = new vscode.Range(startPosition, endPosition);
        // Return the decoration option applying to this range
        // The style itself is defined in the DecorationManager for 'warningBlockBorder'
        return [{ range: blockRange }];
    } else {
        // End tag not found within search limit
        console.warn(`[getWarningBlockDecorations] Could not find matching {% endwarning %} for tag starting at line ${startPosition.line + 1}`);
        return undefined;
    }
};
