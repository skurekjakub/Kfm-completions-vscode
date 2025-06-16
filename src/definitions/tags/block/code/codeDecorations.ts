import * as vscode from 'vscode';
import { TagInstanceInfo } from '../../../../logic/diagnostics/tags/types';
import { TagDecorationProviderFn } from '../../types';
import { CODE_END_REGEX } from '../../../../constants';

/**
 * Parses a highlight string (e.g., "1,3-5,8") into a set of relative line numbers.
 * Based on the original implementation in highlightProvider.ts.
 *
 * @param {string | undefined} value - The string value from the 'highlight' attribute.
 * @returns {Set<number>} A set containing the relative line numbers to highlight (1-based).
 */
function parseHighlightString(value: string | undefined): Set<number> {
    const lines = new Set<number>();
    if (!value) {
        return lines;
    }
    // Split by comma and process each part
    const parts = value.split(',');
    for (const part of parts) {
        const trimmedPart = part.trim();
        // Check for ranges (e.g., "3-5")
        if (trimmedPart.includes('-')) {
            const rangeParts = trimmedPart.split('-');
            const start = parseInt(rangeParts[0], 10);
            const end = parseInt(rangeParts[1], 10);
            // Add lines in the range if valid
            if (!isNaN(start) && !isNaN(end) && end >= start && start > 0) {
                for (let i = start; i <= end; i++) {
                    lines.add(i);
                }
            }
        } else {
            // Handle single line numbers
            const lineNum = parseInt(trimmedPart, 10);
            if (!isNaN(lineNum) && lineNum > 0) {
                lines.add(lineNum);
            }
        }
    }
    return lines;
}

/**
 * Generates decoration options for highlighting lines within a {% code %} block instance.
 * Reads the 'highlight' attribute and calculates ranges relative to the block.
 *
 * @param {Readonly<TagInstanceInfo>} tagInstance - Information about the specific {% code %} tag instance.
 * @param {vscode.TextDocument} document - The text document being processed.
 * @returns {vscode.DecorationOptions[] | undefined} An array of decoration options for highlighted lines, or undefined.
 */
export const getCodeBlockDecorations: TagDecorationProviderFn = (tagInstance, document) => {
    // This provider only applies to the opening tag instance
    if (!tagInstance.isOpeningTag) {
        return undefined;
    }

    // Get the value of the 'highlight' attribute (case-insensitive lookup)
    const highlightValue = tagInstance.attributes['highlight'];
    if (!highlightValue) {
        // No highlight attribute present
        return undefined;
    }

    // Parse the highlight string into relative line numbers
    const relativeLinesToHighlight = parseHighlightString(highlightValue);
    if (relativeLinesToHighlight.size === 0) {
        // No valid lines parsed from the attribute
        return undefined;
    }

    const decorationOptions: vscode.DecorationOptions[] = [];
    const startLineIndex = tagInstance.tagRange.start.line; // 0-based index of the opening tag line

    // --- Find the end line of the code block ---
    // We need to search forward from the opening tag line
    // This is less efficient than using a pre-computed list but keeps the provider self-contained for now.
    let endLineIndex = -1;
    let currentLineIndex = startLineIndex + 1;
    while (currentLineIndex < document.lineCount) {
        const lineText = document.lineAt(currentLineIndex).text;
        if (CODE_END_REGEX.test(lineText)) {
            endLineIndex = currentLineIndex;
            break;
        }
        // Optimization: Stop searching if we hit another opening code tag? Maybe not necessary.
        currentLineIndex++;
    }

    // If no end tag is found within the document, we can't reliably highlight
    if (endLineIndex === -1) {
        console.warn(`[getCodeBlockDecorations] Could not find closing {% endcode %} for tag starting on line ${startLineIndex + 1}`);
        return undefined;
    }
    // --- End of finding end line ---

    // Generate decoration options for each relative line number
    relativeLinesToHighlight.forEach(relativeLine => {
        // Calculate the absolute line index (0-based) in the document
        const absoluteLineIndex = startLineIndex + relativeLine;

        // Ensure the line to highlight is strictly *within* the code block boundaries
        if (absoluteLineIndex > startLineIndex && absoluteLineIndex < endLineIndex) {
            // Check if the absolute line index is valid within the document
            if (absoluteLineIndex < document.lineCount) {
                // Get the full range of the line to apply the background color
                const range = document.lineAt(absoluteLineIndex).range;
                decorationOptions.push({ range });
                 // console.log(`[getCodeBlockDecorations] Adding highlight for absolute line: ${absoluteLineIndex + 1} (relative: ${relativeLine})`);
            }
        } else {
             // console.log(`[getCodeBlockDecorations] Skipping relative line ${relativeLine}: outside block boundaries (${startLineIndex + 1}-${endLineIndex + 1})`);
        }
    });

    return decorationOptions.length > 0 ? decorationOptions : undefined;
};
