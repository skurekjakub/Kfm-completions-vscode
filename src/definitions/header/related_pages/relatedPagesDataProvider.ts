import * as vscode from 'vscode';
import { HeaderContext } from '../../../logic/completions/helpers/headerContext.types';
import { HeaderAttribute } from '../types';
import { pageFileHeaders } from '../../../logic/filesystem/workspaceFileLoader';

// Example provider for related_pages (Needs proper implementation for array values)
export async function getRelatedPagesCompletions(
  document: vscode.TextDocument,
  position: vscode.Position,
  headerContext: HeaderContext, // Use context to determine if inside brackets/quotes
  attrDef: HeaderAttribute,
  currentAttributes: Record<string, any>
): Promise<vscode.CompletionItem[] | undefined> {
  // Basic implementation: Suggests page identifiers.
  const currentDocIdentifier = currentAttributes['identifier']; // Get current page ID to exclude it

  return pageFileHeaders // Assumes pageFileHeaders is populated
      .filter(header => header.identifier && header.identifier !== currentDocIdentifier)
      .map(header => {
          const item = new vscode.CompletionItem(
              `${header.title || 'Untitled'} (${header.identifier})`,
              vscode.CompletionItemKind.EnumMember
          );

          item.insertText = header.identifier; // No quotes needed now
          item.detail = `Page: ${header.title} -- Collection: ${header.collection} (ID: ${header.identifier})`;
          item.sortText = `B_${header.title || header.identifier}`;
          item.preselect = true;
          return item;
      });
}
