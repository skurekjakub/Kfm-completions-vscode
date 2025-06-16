// src/definitions/header/helpers.ts

import * as vscode from 'vscode';
// Import necessary types
import { MissingAttributeCompletionProviderFn } from '../types';

export const getRelatedPagesMissingAttributeCompletion: MissingAttributeCompletionProviderFn = async (
    document,
    position,
    headerContext, // Receive the context
    attrDef // Receive the redirect_from definition
) => {
    // Check if we have the necessary parsed header data from the context
    if (!headerContext.parsedHeader) {
        return undefined; // Cannot proceed without parsed data
    }

    const item = new vscode.CompletionItem(attrDef.name, vscode.CompletionItemKind.Property);

    // Use the list format snippet defined previously
    item.insertText = new vscode.SnippetString(`${attrDef.name}:\n  - $0`);
    item.documentation = new vscode.MarkdownString(`Adds 'related_pages' with first item.`);
    item.detail = `Preps an empty first item for autocompletion.`;
    item.sortText = attrDef.required ? `A_${attrDef.name}` : `B_${attrDef.name}`;
    item.preselect = attrDef.required;
    return item;
};