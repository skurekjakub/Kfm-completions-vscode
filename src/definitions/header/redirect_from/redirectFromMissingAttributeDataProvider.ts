// src/definitions/header/helpers.ts

import * as vscode from 'vscode';
// Import necessary types
import { MissingAttributeCompletionProviderFn } from '../types';

export const getRedirectFromMissingAttributeCompletion: MissingAttributeCompletionProviderFn = async (
    document,
    position,
    headerContext, // Receive the context
    attrDef // Receive the redirect_from definition
) => {
    // Check if we have the necessary parsed header data from the context
    if (!headerContext.parsedHeader) {
        return undefined; // Cannot proceed without parsed data
    }

    const currentIdentifier = headerContext.parsedHeader['identifier'];

    // Only create the custom item if an identifier exists
    if (currentIdentifier && typeof currentIdentifier === 'string') {
        const redirectValue = `x/${currentIdentifier}`;
        const item = new vscode.CompletionItem(attrDef.name, vscode.CompletionItemKind.Property);

        // Use the list format snippet defined previously
        item.insertText = new vscode.SnippetString(`${attrDef.name}:\n  - ${redirectValue}\n$0`);
        item.documentation = new vscode.MarkdownString(`Adds 'redirect_from' list with first item based on current identifier '${currentIdentifier}'.`);
        item.detail = `(Auto-list item: - ${redirectValue})`;
        item.sortText = attrDef.required ? `A_${attrDef.name}` : `B_${attrDef.name}`;
        item.preselect = attrDef.required;
        return item;
    } else {
         console.log("Cannot create custom 'redirect_from' completion: 'identifier' missing.");
         // Optionally return a default item here, or undefined to let the provider use its default
         return undefined; // Let provider handle default if identifier isn't found
    }
};