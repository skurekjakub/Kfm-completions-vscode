// src/completions/warningTagCompletion.ts
import { CompletionItem, SnippetString, MarkdownString } from "vscode";
import { TagNames } from "../../../../constants";
import { SnippetProviderFn } from "../../types";

/**
 * Generates a completion item for the 'warning' admonition tag snippet.
 * This tag creates a styled block for displaying warnings or cautionary messages.
 */
export const warningTagCompletion: SnippetProviderFn = async (): Promise<CompletionItem> => {
  const warningCompletion = new CompletionItem(TagNames.WARNING);

  // Define the snippet string with placeholders
  // $1: Optional attribute to disable the default icon (if applicable)
  // $0: Cursor position for entering the warning content
  warningCompletion.insertText = new SnippetString(
    '{% ' + `${TagNames.WARNING}` + '${1: icon=false} %}\n' + // Use \n for newlines within snippet strings
    '$0\n' +
    '{% end' + `${TagNames.WARNING}` + ' %}'
  );

  // Add documentation displayed to the user
  warningCompletion.documentation = new MarkdownString(
    "Inserts a `warning` admonition block snippet.\n\n" +
    "- Use the block to highlight potential issues, dangers, or important warnings.\n" +
    "- The `icon=false` attribute is optional; remove it if you want the default warning icon (or if the tag doesn't support this attribute)."
  );

  // Set preselect and sortText properties
  warningCompletion.preselect = true;
  warningCompletion.sortText = 'AtcmplWarningTagSnippet'; // Custom sort text for specific ordering (e.g., grouping admonitions)

  return warningCompletion;
};