// src/definitions/header/helpers.ts

import * as vscode from 'vscode';
// Import necessary types and existing functions
import { HeaderContext } from '../../../logic/completions/helpers/headerContext.types'; // Path depends on where HeaderContext is defined
import { HeaderAttribute } from '../types';

// ... existing getLicenseCompletions and getRelatedPagesCompletions ...

/**
 * Provides a completion suggestion for 'redirect_from' based on the
 * 'identifier' attribute in the current header context.
 */
export async function getRedirectFromCompletion(
    document: vscode.TextDocument,
    position: vscode.Position,
    headerContext: HeaderContext, // Accepts the full context object
    attrDef: HeaderAttribute, // The definition for redirect_from
    // currentAttributes is also passed by the provider, equivalent to parsedHeader
    currentAttributes: Record<string, any>
): Promise<vscode.CompletionItem[] | undefined> {

    const completions: vscode.CompletionItem[] = [];

    // Extract the identifier from the parsed header data within the context
    const identifier = currentAttributes['identifier']; // Or headerContext.parsedHeader?.['identifier']

    if (identifier && typeof identifier === 'string' && identifier.trim() !== '') {
        const suggestion = `x/${identifier}`; // Construct the desired value

        const item = new vscode.CompletionItem(suggestion, vscode.CompletionItemKind.Value);
        item.insertText = suggestion;
        item.detail = `Redirect based on current identifier`;
        item.documentation = new vscode.MarkdownString(`Suggests redirect value: \`${suggestion}\``);
        item.sortText = `A_redirect`; // High priority
        item.preselect = true;
        completions.push(item);
    } else {
        // Optional: Log if identifier is missing when trying to complete redirect_from
        console.log("Cannot suggest 'redirect_from': 'identifier' is missing or empty in the header.");
    }

    return completions; // Return array with one item or empty array
}