// definitions/inline/tableOfContents/types.ts

import * as vscode from 'vscode'; // Import vscode types
import { TagNames } from "../../../../constants"; // Adjust path if needed
import { SnippetProviderFn } from "../../types"; // Adjust path

// --- Define the Snippet Generation Function ---
export const tocTagCompletion: SnippetProviderFn = async (): Promise<vscode.CompletionItem> => {
    // Assumes TOC is defined in TagNames
    const tocCompletion = new vscode.CompletionItem(TagNames.TOC, vscode.CompletionItemKind.Snippet);

    // Define the snippet string, including optional common attributes
    // $1 allows easy deletion/tabbing past optional attributes
    // $2 is placeholder for maxHeadingLevel value
    // $0 is final cursor position
    tocCompletion.insertText = new vscode.SnippetString(
        '{% ' + `${TagNames.TOC}` + ' ${1:maxHeadingLevel="$2"} %}$0'
    );

    // Add documentation displayed to the user
    tocCompletion.documentation = new vscode.MarkdownString(
        "Inserts an inline Table of Contents tag.\n\n" +
        "- Generates a ToC based on headings in the current document.\n" +
        "- Optional attributes:\n" +
        "  - `minHeadingLevel=\"<level>\"` (e.g., 2)\n" +
        "  - `maxHeadingLevel=\"<level>\"` (e.g., 3)"
    );

    // Set preselect and sortText properties
    tocCompletion.preselect = true; // Or false
    tocCompletion.sortText = 'AtcmplTocTagSnippet'; // Consistent sort text

    return tocCompletion;
};