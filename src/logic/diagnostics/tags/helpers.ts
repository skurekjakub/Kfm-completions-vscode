import * as vscode from 'vscode';
import { TagAttribute } from '../../../definitions/tags/types'; // Use TagAttribute type

/**
 * Creates a VS Code Diagnostic object with consistent sourcing.
 * @param range The range the diagnostic should cover.
 * @param message The diagnostic message.
 * @param severity The severity (Error, Warning, Info, Hint).
 * @param code A unique code for the diagnostic type, e.g., TAG-TYPE-TAGNAME-ATTRNAME.
 * @returns A configured vscode.Diagnostic object.
 */
export function createTagDiagnostic(range: vscode.Range, message: string, severity: vscode.DiagnosticSeverity, code: string): vscode.Diagnostic {
  const diagnostic = new vscode.Diagnostic(range, message, severity);
  diagnostic.source = 'Tag Linter'; // Consistent source name
  diagnostic.code = code;
  return diagnostic;
}

/**
 * Checks if the actual value (usually parsed as a string from tag attributes)
 * matches the expected data type defined in TagAttribute.
 * @param actualValueString The actual value string parsed from the tag attribute.
 * @param expectedType The dataType string from the TagAttribute definition.
 * @returns True if the type matches or can be considered valid, false otherwise.
 */
export function checkTagAttributeType(actualValueString: string | undefined, expectedType: TagAttribute['dataType']): boolean {
    // If the attribute doesn't exist (value is undefined), type checking doesn't apply here.
    // Required attribute checks handle missing attributes.
    if (actualValueString === undefined) {
        return true;
    }

    const actualTrimmedValue = actualValueString.trim();

    switch (expectedType) {
        case 'string':
            // Any non-empty string is generally considered a valid string attribute value.
            // Specific format validation (like URL, email) would be a separate rule if needed.
            return typeof actualValueString === 'string'; // Check if it's fundamentally a string
        case 'number':
            // Check if the string represents a finite number.
            return !isNaN(parseFloat(actualTrimmedValue)) && isFinite(Number(actualTrimmedValue));
        case 'boolean':
            // Accept 'true' or 'false' (case-insensitive) or empty string for boolean flags
            const lowerValue = actualTrimmedValue.toLowerCase();
            return lowerValue === 'true' || lowerValue === 'false' || actualTrimmedValue === '';
        case 'string[]':
            // This is ambiguous for tags. Usually, it's a single string value.
            // If a tag specifically expects comma-separated values, a custom validation rule
            // might be needed to parse and check it. For basic type check, allow any string.
            // If it MUST be parsable as non-empty CSV, add stricter check here or in a rule.
             return typeof actualValueString === 'string'; // Allow any string for now
        case 'object':
             // Tags typically don't have object attributes like headers. Treat as invalid type expectation.
             console.warn(`[Tag Diagnostics Helper]: Unexpected 'object' type check requested for tag attribute.`);
             return false;
        case undefined: // No type defined in attribute definition
             return true; // Always valid if no type is specified
        default:
             console.warn(`[Tag Diagnostics Helper]: Unknown expected type encountered: ${expectedType}`);
             return true; // Treat unknown expected types as valid to avoid spurious errors
    }
}

/**
 * Finds the precise range of a specific attribute's *value* within an opening tag's text.
 * This is crucial for highlighting the problematic value, not the whole tag.
 * Handles quoted (single/double) and unquoted values.
 *
 * @param document The text document (needed for position calculations).
 * @param tagRange The range of the entire opening tag instance.
 * @param attributeName The name of the attribute whose value range is needed.
 * @returns The Range of the attribute's value, or undefined if attribute/value not found.
 */
export function findTagAttributeValueRange(document: vscode.TextDocument, tagRange: vscode.Range, attributeName: string): vscode.Range | undefined {
    const tagText = document.getText(tagRange);
    const lowerAttrName = attributeName.toLowerCase(); // Use lowercase for matching

    // Regex breakdown:
    // \\b(${attributeName}) : Match the attribute name (case-insensitive via 'i' flag), word boundary start. Capture name.
    // \\s*=\\s* : Match equals sign, allowing whitespace around it.
    // (?:                   : Start non-capturing group for different value types.
    //   "((?:\\\\\"|[^"])*)" : Capture group 2: Double-quoted value. Handles escaped quotes \\".
    //  |'((?:\\\\'|[^'])*)'  : OR Capture group 3: Single-quoted value. Handles escaped quotes \\'.
    //  |([^%\\s'">]+)       : OR Capture group 4: Unquoted value (chars not whitespace, %, ', ", >).
    // )                     : End non-capturing group for values.
    // Matches might not capture a value group if it's a boolean flag (e.g., just 'border').
    const attrRegex = new RegExp(`\\b(${attributeName})\\s*=\\s*(?:"((?:\\\\"|[^"])*)"|'((?:\\\\'|[^'])*)'|([^%\\s'">]+))`, 'gi');

    let match;
    let valueRange: vscode.Range | undefined = undefined;

    // Iterate through matches in case the attribute name appears multiple times (though unlikely for valid tags)
    while ((match = attrRegex.exec(tagText)) !== null) {
        // Ensure the matched key (case-insensitive) is the one we're looking for
        if (match[1].toLowerCase() === lowerAttrName) {
            const valuePart = match[2] ?? match[3] ?? match[4]; // Get the captured value string

            if (valuePart !== undefined) { // Check if a value was actually captured (not just a boolean flag)
                const matchIndex = match.index ?? 0;
                // Find the start of the value *within the match* (after the key= part)
                // Search for the start of the value string within the full match[0]
                const valueStartIndexInMatch = match[0].indexOf(valuePart, match[1].length); // Start search after the key

                if (valueStartIndexInMatch !== -1) {
                    const absoluteValueStartOffset = document.offsetAt(tagRange.start) + matchIndex + valueStartIndexInMatch;
                    const absoluteValueEndOffset = absoluteValueStartOffset + valuePart.length;

                    valueRange = new vscode.Range(
                        document.positionAt(absoluteValueStartOffset),
                        document.positionAt(absoluteValueEndOffset)
                    );
                    // Found the specific attribute, break loop (assuming first match is correct)
                    break;
                }
            }
            // Handle boolean flags? If valuePart is undefined, should we return range of the key?
            // For highlighting errors in value, we probably only care when a value *exists*.
            // So returning undefined for boolean flags seems reasonable here.
        }
    }

    return valueRange;
}

/**
 * Finds the precise range of a specific attribute's *name* (key) within an opening tag's text.
 * Useful for highlighting unknown or misspelled attribute names.
 *
 * @param document The text document.
 * @param tagRange The range of the entire opening tag instance.
 * @param attributeName The attribute name (key) as it appears in the tag instance text.
 * @returns The Range of the attribute's name, or undefined if not found.
 */
export function findTagAttributeNameRange(document: vscode.TextDocument, tagRange: vscode.Range, attributeName: string): vscode.Range | undefined {
    const tagText = document.getText(tagRange);

    // Use regex to find the attribute name as a distinct word before an equals sign or as a standalone flag
    // Need to be careful not to match substrings within other names. Use word boundaries (\b).
    // Match the specific attribute name provided (case should match how it was parsed).
    const nameRegex = new RegExp(`\\b(${attributeName})(?=\\s*=|\\s*[%}])`, 'g'); // Positive lookahead for '=' or end of tag '%}' / whitespace boundary
    let match;
    let nameRange: vscode.Range | undefined = undefined;

    // Find the first occurrence of this specific attribute name within the tag text
    if ((match = nameRegex.exec(tagText)) !== null) {
        const matchIndex = match.index ?? 0;
        const namePart = match[1]; // Should be the attributeName

        if (namePart === attributeName) { // Double check it's the exact name we searched for
            const absoluteNameStartOffset = document.offsetAt(tagRange.start) + matchIndex;
            const absoluteNameEndOffset = absoluteNameStartOffset + namePart.length;

            nameRange = new vscode.Range(
                document.positionAt(absoluteNameStartOffset),
                document.positionAt(absoluteNameEndOffset)
            );
        }
    }

    return nameRange;
}
