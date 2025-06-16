import * as vscode from 'vscode';
import { TagValidationContext, TagValidationRuleFn } from '../types'; // Adjust import path if needed
import { createTagDiagnostic } from '../helpers'; // Adjust import path if needed
import { TagNames } from '../../../../constants'; // Make sure TagNames is imported

// Regex to detect common Markdown list item starts (ignoring leading whitespace)
const MARKDOWN_LIST_REGEX = /^\s*([-*+]|\d+\.)\s+/;

/**
 * Validates that a closing pair tag does not immediately follow a Markdown list item
 * on the preceding line, suggesting a newline for better rendering/parsing.
 */
export const validateNewlineAfterListBeforeEndTag: TagValidationRuleFn = (context) => {
    const { tagDefinition, tagInstance, document } = context;
    const diagnostics: vscode.Diagnostic[] = [];

    // This rule only applies to closing tags of pair tags
    if (!tagInstance.isClosingTag || !tagDefinition.isPairTag) {
        return diagnostics;
    }

    const closingTagLineNumber = tagInstance.tagRange.start.line;

    // Check if there's a line before the closing tag
    if (closingTagLineNumber > 0) {
        const precedingLineNumber = closingTagLineNumber - 1;
        try {
            const precedingLine = document.lineAt(precedingLineNumber);
            // Check if the preceding line looks like a list item
            if (MARKDOWN_LIST_REGEX.test(precedingLine.text)) {
                diagnostics.push(createTagDiagnostic(
                    tagInstance.tagRange, // Highlight the closing tag
                    `Add a newline before the closing tag '{% end${tagInstance.tagName} %}' when it follows a list item to avoid potential malformed content.`,
                    vscode.DiagnosticSeverity.Warning, // This is a style/clarity warning
                    `TAG-NEWLINE-END-${tagInstance.tagName.toUpperCase()}`
                ));
            }
        } catch (e) {
            // Handle potential errors if lineAt fails
            console.error(`[validateNewlineAfterListBeforeEndTag]: Error accessing line ${precedingLineNumber}`, e);
        }
    }

    return diagnostics;
};