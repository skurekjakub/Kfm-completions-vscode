// src/completions/tipTagCompletion.ts
import { CompletionItem, SnippetString, MarkdownString } from "vscode";
import { TagNames } from "../../../../constants";
import { SnippetProviderFn } from "../../types";

/**
 * Generates a completion item for the 'tip' admonition tag snippet.
 * This tag creates a styled block for displaying helpful tips or suggestions.
 */
export const tipTagCompletion : SnippetProviderFn = async () : Promise<CompletionItem> => {
  const tipCompletion = new CompletionItem(TagNames.TIP);

  // Define the snippet string with placeholders
  // $1: Optional attribute to disable the default icon (if applicable)
  // $0: Cursor position for entering the tip content
  tipCompletion.insertText = new SnippetString(
    '{% ' + `${TagNames.TIP}` + '${1: icon=false} %}\n' + // Use \n for newlines within snippet strings
    '$0\n' +
    '{% end' + `${TagNames.TIP}` + ' %}'
  );

  // Add documentation displayed to the user
  tipCompletion.documentation = new MarkdownString(
    "Inserts a `tip` admonition block snippet.\n\n" +
    "- Use the block to provide helpful tips, suggestions, or best practices.\n" +
    "- The `icon=false` attribute is optional; remove it if you want the default tip icon (or if the tag doesn't support this attribute)."
  );

  // Set preselect and sortText properties
  tipCompletion.preselect = true;
  tipCompletion.sortText = 'AtcmplTipTagSnippet'; // Custom sort text for specific ordering (e.g., grouping admonitions)

  return tipCompletion;
};