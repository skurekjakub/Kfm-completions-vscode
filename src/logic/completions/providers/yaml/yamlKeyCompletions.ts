// logic/completions/providers/yaml/yamlKeyCompletions.ts
import * as vscode from 'vscode';
import { YamlObjectDefinition } from '../../../../definitions/yaml/types';

/**
 * Generates key completion items based on regex context, scanning up and down.
 * @param objectDefinition The definition for keys to suggest.
 * @param completionIndentation The indentation level where keys should appear.
 * @param document The document being edited.
 * @param completionLineIndex The line index where completion is requested.
 * @returns Array of completion items.
 */
export function getKeyCompletionsRegex(
    objectDefinition: YamlObjectDefinition,
    completionIndentation: number,
    document: vscode.TextDocument,
    completionLineIndex: number
): vscode.CompletionItem[] {
    const completions: vscode.CompletionItem[] = [];
    if (!objectDefinition?.attributes) {
        console.warn(`[YamlCompletionProviderRegex] getKeyCompletionsRegex called with invalid objectDefinition.`);
        return completions;
    }
    console.log(`[YamlCompletionProviderRegex] Providing KEY completions for definition ID: ${objectDefinition.id || 'unknown'} at indent ${completionIndentation}.`);

    const existingKeys = new Set<string>();

    // Find parent indentation to define scope boundaries
    let parentIndentCheck = -1;
    let parentLineIndex = completionLineIndex - 1;
    while (parentLineIndex >= 0) {
        const line = document.lineAt(parentLineIndex);
        const indent = line.firstNonWhitespaceCharacterIndex;
        // Check non-empty, non-comment lines
        if (!line.isEmptyOrWhitespace && !line.text.trim().startsWith('#')) {
            // Check if this line could be the parent or is part of the same block
            if (indent < completionIndentation) {
                parentIndentCheck = indent;
                break; // Found the first line above with less indentation
            }
        }
        parentLineIndex--;
    }

    // --- Scan Upwards ---
    for (let lineIndex = completionLineIndex - 1; lineIndex >= 0; lineIndex--) {
        const line = document.lineAt(lineIndex);
        const indent = line.firstNonWhitespaceCharacterIndex;
        const text = line.text.trim();

        if (text === '' || text.startsWith('#')) { continue; }
        // Stop if indentation is less than current level OR exactly matches parent indent
        if (indent < completionIndentation || (indent === parentIndentCheck && parentIndentCheck !== -1)) { break; }

        if (indent === completionIndentation) {
            // Match key: or potentially sequence item '- key:' if that's relevant at this level
            const keyMatch = text.match(/^(\w+):\s*.*$/) || text.match(/^-\s+(\w+):\s*.*$/);
            if (keyMatch) { existingKeys.add(keyMatch[1]); }
        }
    }

    // --- Scan Downwards ---
    for (let lineIndex = completionLineIndex + 1; lineIndex < document.lineCount; lineIndex++) {
        const line = document.lineAt(lineIndex);
        const indent = line.firstNonWhitespaceCharacterIndex;
        const text = line.text.trim();

        if (text === '' || text.startsWith('#')) { continue; }
        // Stop if indentation is less than current level OR exactly matches parent indent
        if (indent < completionIndentation || (indent === parentIndentCheck && parentIndentCheck !== -1)) { break; }

        if (indent === completionIndentation) {
            // Match key: or potentially sequence item '- key:'
            const keyMatch = text.match(/^(\w+):\s*.*$/) || text.match(/^-\s+(\w+):\s*.*$/);
            if (keyMatch) { existingKeys.add(keyMatch[1]); }
        }
    }


    console.log(`[YamlCompletionProviderRegex] Existing sibling keys found (up/down): [${Array.from(existingKeys).join(', ')}]`);

    // --- Generate Completions ---
    for (const attrDef of objectDefinition.attributes) {
        if (attrDef.name && !existingKeys.has(attrDef.name)) {
            const item = new vscode.CompletionItem(attrDef.name, vscode.CompletionItemKind.Property);
            item.documentation = new vscode.MarkdownString(attrDef.description || `YAML property: ${attrDef.name}`);

            let snippetValue = ` \${1:${attrDef.defaultValue || ''}}`; // Default: space + placeholder
            if (attrDef.dataType === 'object' || attrDef.listItemObjectDefinition) {
                const nextIndent = ' '.repeat(completionIndentation + 2);
                snippetValue = `\n${nextIndent}\${1:}`; // Newline, indent, placeholder
            } else if (attrDef.dataType === 'string[]') {
                const nextIndent = ' '.repeat(completionIndentation + 2);
                snippetValue = `\n${nextIndent}- \${1}`; // Newline, indent, list item, placeholder
            } else if (attrDef.values && attrDef.values.length > 0) {
                snippetValue = ` \${1|${attrDef.values.map(String).join(',')}|}`; // Space + choices
            }

            // Add colon only if snippet doesn't start with newline
            const colon = snippetValue.startsWith('\n') ? '' : ':';
            item.insertText = new vscode.SnippetString(`${attrDef.name}${colon}${snippetValue}`);

            item.sortText = `AAA_${attrDef.name}`;
            item.preselect = attrDef.required;
            completions.push(item);
        }
    }
    console.log(`[YamlCompletionProviderRegex] Generated ${completions.length} key completions.`);
    return completions;
}