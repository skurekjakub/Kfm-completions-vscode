import * as vscode from 'vscode';
// Import the signature for the provider function
import { YamlAttributeValueProviderFn } from '../types';
// Import the loaded config data and page headers from the workspace loader
import { pageFileHeaders } from '../../../logic/filesystem/workspaceFileLoader';

/**
 * Provides completion items for YAML keys that expect a page identifier.
 * Reads identifiers from the loaded pageFileHeaders.
 * Also adds an additional edit to insert the corresponding 'collection' on the next line.
 *
 * @implements {YamlAttributeValueProviderFn}
 */
export const getPageIdentifierCompletions: YamlAttributeValueProviderFn = async (
    document, position, nodePath, parentNode
) => {
    const completions: vscode.CompletionItem[] = [];

    // Check if the page header data has been loaded
    if (!pageFileHeaders || pageFileHeaders.length === 0) {
        console.warn("[getPageIdentifierCompletions] Page headers not loaded yet.");
        return undefined;
    }

    console.log(`[getPageIdentifierCompletions] Providing completions from ${pageFileHeaders.length} loaded headers.`);

    // Determine indentation for the additional edit
    // Use the character position of the completion request as a simple proxy
    // or analyze the line's indentation.
    const currentLine = document.lineAt(position.line);
    const indentation = ' '.repeat(currentLine.firstNonWhitespaceCharacterIndex); // Use indentation of the identifier line

    for (const header of pageFileHeaders) {
        if (!header.identifier || !header.collectionId) {continue;} // Skip if essential data missing

        const item = new vscode.CompletionItem(header.identifier, vscode.CompletionItemKind.Reference); // Use Reference kind

        // Simple insert text is just the identifier
        item.insertText = header.identifier;
        item.label = `${header.title || 'Untitled'} (${header.collectionId})`;
        // Add detail showing the page title and collection
        item.detail = `Page: ${header.title || 'Untitled'} (Collection: ${header.collectionId})`;
        item.documentation = new vscode.MarkdownString(`Identifier: \`${header.identifier}\`\n\nTitle: ${header.title || 'N/A'}\n\nCollection: ${header.collectionId}`);
        item.sortText = `AAA_${header.title}`;

        // Calculate the position for the new line (end of the current line)
        const nextLine = new vscode.Position(position.line, indentation.length);
        const nextLineStart = new vscode.Position(position.line + 1, 0);
        // Text to insert: newline, indentation, key, value
        const textToInsert = `collection: ${header.collectionId.substring(1)}\n${indentation}`;
        item.additionalTextEdits = [
            vscode.TextEdit.insert(nextLine, textToInsert),
            vscode.TextEdit.insert(nextLineStart, '\n')
            
        ];

        completions.push(item);
    }

    return completions;
};


// Add other YAML value providers here later (e.g., getFilenameCompletions, getHeadingCompletions etc.)

