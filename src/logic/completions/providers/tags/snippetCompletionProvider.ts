// logic/completions/providers/snippetCompletionProvider.ts
import * as vscode from 'vscode';
import { MARKDOWN } from '../../../../constants'; // Adjust path
import { TagUtils } from '../../../_helpers/tagUtils'; // Import TagUtils
import { getAllTagDefinitions } from '../../../../definitions/definitionRegister';
import { findHeaderRange } from '../../helpers/headerUtils';

/**
 * Central provider for tag snippets.
 * Iterates through tag definitions and calls their respective snippetProvider functions.
 */
export const snippetCompletionProvider = vscode.languages.registerCompletionItemProvider(
    MARKDOWN,
    {
        async provideCompletionItems(document: vscode.TextDocument, position: vscode.Position): Promise<vscode.CompletionItem[] | undefined> {

            // Prevent completions inside the YAML header
            if (findHeaderRange(document, position)) {
                console.log("Snippet Provider: Cursor is inside header, skipping tag snippets.");
                return undefined; // Don't provide tag snippets inside the header
           }

            // Prevent snippets inside existing tags
            if (TagUtils.isInsideOpeningTagDefinition(document, position)) {
                return undefined;
            }

            const parentTagName = TagUtils.findEnclosingParentTag(document, position);
            const completionPromises: Promise<vscode.CompletionItem>[] = [];
            const allDefinitions = getAllTagDefinitions();

            // Iterate through the definitions obtained from the registry
            allDefinitions.forEach(tagDefinition => {
                let showSnippet = false;
                const allowedParents = tagDefinition.allowedParents;

                if (!allowedParents || allowedParents.length === 0) {
                    // If allowedParents is NOT defined or is empty, ALWAYS show the snippet
                    // (as long as we're not inside definition braces, checked above)
                    showSnippet = true;
                } else {
                    // If allowedParents IS defined, the current parentTagName MUST be in the list.
                    // Note: parentTagName is undefined if at root. The .includes check will handle this correctly
                    // (e.g., it will be false if parentTagName is undefined unless allowedParents explicitly contains undefined/null).
                    // If you want to allow root explicitly via the list, the convention needs adjustment.
                    // Assuming standard case: list contains specific TagNames.
                    if (parentTagName !== undefined && allowedParents.includes(parentTagName)) {
                        showSnippet = true;
                    }
                }

                if (showSnippet && tagDefinition.snippetProvider) {
                    completionPromises.push(tagDefinition.snippetProvider());
                }
            });

            // Wait for all promises to resolve and return the array of CompletionItems
            try {
                const completionItems = await Promise.all(completionPromises);
                return completionItems.filter(item => item !== undefined); // Filter out any potential undefined results
            } catch (error) {
                console.error("Error generating snippet completions:", error);
                return [];
            }
        }
    }
    // No specific trigger characters needed
);