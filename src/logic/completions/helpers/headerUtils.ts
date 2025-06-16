import * as vscode from 'vscode';
import YAML from 'yaml';

/**
 * Checks if the position is within the --- YAML header block.
 * Returns the range if true.
 */
export function findHeaderRange(document: vscode.TextDocument, position: vscode.Position): vscode.Range | undefined {
    // Implementation: Search backwards and forwards for '---' lines at the start of the file.
    // Consider edge cases like files without headers or malformed headers.
    let startLine = -1;
    let endLine = -1;
    if (document.lineAt(0).text.trim() === '---') {
        startLine = 0;
        for (let i = 1; i < document.lineCount; i++) {
            if (document.lineAt(i).text.trim() === '---') {
                endLine = i;
                break;
            }
        }
    }

    if (startLine === 0 && endLine > startLine && position.line > startLine && position.line < endLine) {
        return new vscode.Range(document.lineAt(startLine).range.start, document.lineAt(endLine).range.end);
    }
    return undefined;
}

/**
 * Finds the range of the YAML header block (---...---) at the start of the document,
 * without needing a specific cursor position.
 *
 * @param document The text document.
 * @returns The Range of the header block (including --- lines), or undefined if not found or invalid.
 */
export function getHeaderBlockRange(document: vscode.TextDocument): vscode.Range | undefined {
    // Implementation is similar to findHeaderRange but without the position check
    let startLine = -1;
    let endLine = -1;

    if (document.lineCount > 1 && document.lineAt(0).text.trim() === '---') {
        startLine = 0;
        for (let i = 1; i < document.lineCount; i++) {
            if (document.lineAt(i).text.trim() === '---') {
                endLine = i;
                break;
            }
        }
    }

    // Check if a valid header block was found (at least ---, content, ---)
    if (startLine === 0 && endLine > startLine) {
         return new vscode.Range(
             document.lineAt(startLine).range.start, // Start of first '---'
             document.lineAt(endLine).range.end     // End of second '---'
         );
    }

    return undefined; // No valid header block found
}


/**
 * Parses the YAML header content within a given range.
 */
/**
 * Parses the YAML header content within a given range.
 */
export function parseHeaderContent(document: vscode.TextDocument, headerRange: vscode.Range): Record<string, any> | undefined {
    try {
        // Determine start and end lines for content (exclusive of '---')
        const startLine = headerRange.start.line + 1;
        const endLine = headerRange.end.line - 1; // Line index *before* the closing '---'

        // Ensure there's at least one line of content
        if (startLine > endLine) {
             console.log("parseHeaderContent: No content lines found between '---' markers.");
             return {}; // Return empty object if no content lines
        }

        // Define the precise range for getText
        const startPos = document.lineAt(startLine).range.start;
        const endPos = document.lineAt(endLine).range.end; // Use the actual end of the last content line
        const extractionRange = new vscode.Range(startPos, endPos);

        const headerText = document.getText(extractionRange);

        // --- Add Logging ---
        console.log("--- Parsing Header Text ---");
        // Log with markers to clearly see start/end and whitespace
        console.log(`>>>\n${headerText}\n<<<`);
        console.log("--------------------------");
        // --- End Logging ---

        // Add a newline before parsing just in case the parser expects it after the last line
        const parsedResult = YAML.parse(headerText + '\n');

        // Add check to ensure result is an object
        if (typeof parsedResult === 'object' && parsedResult !== null) {
             return parsedResult as Record<string, any>;
        } else {
             console.warn("YAML.parse did not return an object:", parsedResult);
             return {}; // Return empty object if parsing result isn't an object
        }

    } catch (e) {
        console.error("Failed to parse YAML header:", e);
        return undefined; // Return undefined on parsing error
    }
}
