// src/definitions/header/helpers.ts

import * as vscode from 'vscode';
// Import necessary types
import { MissingAttributeCompletionProviderFn } from '../types';

export const getMissingLicenseAttributeCompletion: MissingAttributeCompletionProviderFn = async (
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
  item.insertText = new vscode.SnippetString(`${attrDef.name}: 1$0`);
  item.documentation = new vscode.MarkdownString(`Adds 'license' attribute.`);
  item.detail = `(Prepopulates with license: 1)`;
  item.sortText = attrDef.required ? `A_${attrDef.name}` : `B_${attrDef.name}`;
  item.preselect = attrDef.required;
  return item;
};