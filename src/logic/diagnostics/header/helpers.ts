import * as vscode from 'vscode';

import { HeaderAttribute } from "../../../definitions/header/types";

// Helper to check JS type against defined dataType string
export function checkType(value: any, expectedType: HeaderAttribute['dataType']): boolean {
  const actualType = typeof value;
  switch (expectedType) {
    case 'string': return actualType === 'string';
    case 'number': return actualType === 'number';
    case 'boolean': return actualType === 'boolean';
    case 'string[]':
      // Allow EITHER a valid string array (all items are strings)
      // OR a single non-empty string.
      return (Array.isArray(value) && value.every(item => typeof item === 'string')) ||
        (actualType === 'string' && value.length > 0);
    case 'object': return actualType === 'object' && !Array.isArray(value) && value !== null;
    default: return true; // No type defined or unknown type
  }
}

/**
 * Finds the precise range of the value part for a specific top-level header attribute.
 *
 * @param document The text document.
 * @param headerRange The range of the entire header block.
 * @param attributeName The name of the attribute key to find.
 * @returns The Range of the attribute's value, or undefined if the key is not found
 * or has no value part.
 */
export function findAttributeValueRange(document: vscode.TextDocument, headerRange: vscode.Range, attributeName: string): vscode.Range | undefined {
  for (let i = headerRange.start.line + 1; i < headerRange.end.line; i++) {
    const line = document.lineAt(i);
    const lineText = line.text;
    // Match key, colon, and capture rest of the line (potential value)
    // Ensure match starts at beginning of line (respecting indentation)
    const match = lineText.match(/^(\s*)(\w+):(.*)$/);

    // --- Fix: Use match[2] for the key name ---
    if (match && match[2] === attributeName) {
      const key = match[2];
      const valueString = match[3]; // The part after the colon

      // Find start of the actual value (first non-whitespace after colon)
      let valueStartIndex = -1;
      for (let j = 0; j < valueString.length; j++) {
        if (valueString[j] !== ' ' && valueString[j] !== '\t') {
          valueStartIndex = j;
          break;
        }
      }

      if (valueStartIndex !== -1) {
        // Calculate character position relative to the start of the line
        // Start index = indent length + key length + colon length + value start index within valueString
        const valueStartChar = match[1].length + key.length + 1 + valueStartIndex;

        // Find end of the actual value (trim trailing whitespace)
        const trimmedValue = valueString.trimEnd();
        const valueEndChar = valueStartChar + trimmedValue.length; // End char is exclusive in Range

        // Return the specific range of the value
        return new vscode.Range(i, valueStartChar, i, valueEndChar);
      } else {
        // Key exists, but the value part is empty or only whitespace
        // Return a zero-length range right after the colon + first space (if any)
        const afterColonChar = match[1].length + key.length + 1;
        const startChar = (valueString.length > 0 && valueString[0] === ' ') ? afterColonChar + 1 : afterColonChar;
        return new vscode.Range(i, startChar, i, startChar);
      }
    }
  }
  return undefined; // Attribute key not found on any line
}

// Helper to find the line number of a top-level key (simple version)
// Adjust this if your YAML structure allows keys at different top-level indents
export function findAttributeLine(document: vscode.TextDocument, headerRange: vscode.Range, attributeName: string): vscode.TextLine | undefined {
  for (let i = headerRange.start.line + 1; i < headerRange.end.line; i++) {
    const line = document.lineAt(i);
    // Simple check for line starting with optional space + key + colon
    // Assumes top-level keys might have some consistent indentation we could check if needed
    const match = line.text.match(/^\s*(\w+):/);
    if (match && match[1] === attributeName) {
      return line;
    }
  }
  return undefined;
}

export function createDiagnostic(range: vscode.Range, message: string, severity: vscode.DiagnosticSeverity, code: string): vscode.Diagnostic {
  const diagnostic = new vscode.Diagnostic(range, message, severity);
  diagnostic.source = 'Header Linter'; // Source name
  diagnostic.code = code;
  return diagnostic;
}
