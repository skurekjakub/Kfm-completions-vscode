import * as vscode from 'vscode';
import { TagValidationContext, TagValidationRuleFn } from '../types'; // Adjust import path
import { createTagDiagnostic } from '../helpers'; // Adjust import path

/**
 * Validates that the indentation level of a closing pair tag matches its
 * corresponding opening tag.
 */
export const validatePairTagIndentation: TagValidationRuleFn = (context) => {
    const { tagInstance, matchingOpeningTag, document } = context;
    const diagnostics: vscode.Diagnostic[] = [];

    // This rule only applies when processing a closing tag that has successfully found its matching opening tag
    if (tagInstance.isClosingTag && matchingOpeningTag) {
        const closingIndent = tagInstance.indentation;
        const openingIndent = matchingOpeningTag.indentation;

        if (closingIndent !== openingIndent) {
            const message = `Closing tag '{% ${tagInstance.tagName} %}' indentation (${closingIndent}) does not match opening tag indentation (${openingIndent}).`;

            // Create diagnostic for the closing tag
            const closingDiag = createTagDiagnostic(
                tagInstance.tagRange,
                message,
                vscode.DiagnosticSeverity.Warning, // Indentation mismatch is a Warning
                `TAG-INDENT-${tagInstance.tagName.toUpperCase()}`
            );

            // Add related information pointing to the opening tag
            closingDiag.relatedInformation = [
                new vscode.DiagnosticRelatedInformation(
                    new vscode.Location(document.uri, matchingOpeningTag.tagRange),
                    `Opening tag is here with indentation ${openingIndent}.`
                )
            ];
            diagnostics.push(closingDiag);

            // Optionally, create a diagnostic for the opening tag as well, pointing to the closing tag
            const openingDiag = createTagDiagnostic(
                matchingOpeningTag.tagRange,
                message, // Same message
                vscode.DiagnosticSeverity.Warning,
                `TAG-INDENT-${tagInstance.tagName.toUpperCase()}` // Same code
            );
            openingDiag.relatedInformation = [
                new vscode.DiagnosticRelatedInformation(
                    new vscode.Location(document.uri, tagInstance.tagRange),
                    `Mismatched closing tag is here with indentation ${closingIndent}.`
                )
            ];
            diagnostics.push(openingDiag);
        }
    }

    return diagnostics;
};