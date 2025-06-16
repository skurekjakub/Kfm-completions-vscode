// src/completions/infoTagCompletion.ts
import { CompletionItem, SnippetString, MarkdownString } from "vscode";
import { TagNames } from "../../../../constants";
import { SnippetProviderFn } from "../../types";

/**
 * Generates a completion item for the 'info' admonition tag snippet.
 * This tag creates a styled block for displaying informational messages.
 */
export const infoTagCompletion: SnippetProviderFn = async (): Promise<CompletionItem> => {
  const infoCompletion = new CompletionItem(TagNames.INFO);

  // Define the snippet string with placeholders
  // $1: Optional attribute to disable the default icon (if applicable)
  // $0: Cursor position for entering the info content
  infoCompletion.insertText = new SnippetString(
    '{% ' + `${TagNames.INFO}` + '${1: icon=false} %}\n' + // Use \n for newlines within snippet strings
    '$0\n' +
    '{% end' + `${TagNames.INFO}` + ' %}'
  );

  // Add documentation displayed to the user
  infoCompletion.documentation = new MarkdownString(
    "Inserts an `info` admonition block snippet.\n\n" +
    "- Use the block to highlight general information.\n" +
    "- The `icon=false` attribute is optional; remove it if you want the default info icon (or if the tag doesn't support this attribute)."
  );

  // Set preselect and sortText properties
  infoCompletion.preselect = true;
  infoCompletion.sortText = 'AtcmplInfoTagSnippet'; // Custom sort text for specific ordering (e.g., grouping admonitions)

  return infoCompletion;
};