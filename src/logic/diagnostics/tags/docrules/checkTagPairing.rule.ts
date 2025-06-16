// logic/diagnostics/tags/rules/checkTagPairing.rule.ts

import * as vscode from 'vscode';
import { TagInstanceInfo, TagDocumentValidationRuleFn } from '../types'; // Adjust path
import { createTagDiagnostic } from '../helpers'; // Adjust path

/**
 * DOCUMENT-LEVEL RULE
 * Checks for tag pairing issues across the document:
 * 1. Unclosed opening tags (items left on the final stack).
 * 2. Mismatched closing tags (closing tags encountered without a matching opener on the stack).
 */
export const checkTagPairing: TagDocumentValidationRuleFn = (
    document,
    allTagsInfo, // Not directly used here, but part of signature
    finalTagStack, // Opening tags left unclosed
    mismatchedClosingTags // Closing tags that didn't match stack top
) => {
    const diagnostics: vscode.Diagnostic[] = [];

    // 1. Check for unclosed opening tags
    if (finalTagStack && finalTagStack.length > 0) {
        finalTagStack.forEach(unclosedTagInfo => {
            diagnostics.push(createTagDiagnostic(
                unclosedTagInfo.tagRange, // Highlight the opening tag
                `Start tag '{% ${unclosedTagInfo.tagName} ... %}' is not closed.`,
                vscode.DiagnosticSeverity.Error, // Unclosed tag is an Error
                `TAG-UNCLOSED-${unclosedTagInfo.tagName.toUpperCase()}`
            ));
        });
    }

    // 2. Check for mismatched closing tags
    if (mismatchedClosingTags && mismatchedClosingTags.length > 0) {
        mismatchedClosingTags.forEach(mismatchedTagInfo => {
            diagnostics.push(createTagDiagnostic(
                mismatchedTagInfo.tagRange, // Highlight the closing tag
                `Unexpected closing tag '{% end${mismatchedTagInfo.tagName} %}' found without a matching opening tag.`,
                vscode.DiagnosticSeverity.Error, // Mismatched end tag is an Error
                `TAG-MISMATCHED-END-${mismatchedTagInfo.tagName.toUpperCase()}`
            ));
        });
    }

    return diagnostics;
};