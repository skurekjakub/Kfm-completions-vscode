// src/completions/noteTagCompletion.ts
import { CompletionItem, SnippetString, MarkdownString } from "vscode";
import { TagNames } from "../../../../constants";
import { SnippetProviderFn } from "../../types";

/**
 * Generates a completion item for the 'note' admonition tag snippet.
 * This tag creates a styled block for displaying notes or important information.
 */
export const noteTagCompletion: SnippetProviderFn = async () : Promise<CompletionItem> => {
  const noteCompletion = new CompletionItem(TagNames.NOTE);

  // Define the snippet string with placeholders
  // $1: Optional attribute to disable the default icon (if applicable)
  // $0: Cursor position for entering the note content
  noteCompletion.insertText = new SnippetString(
    '{% ' + `${TagNames.NOTE}` + '${1: icon=false} %}\n' + // Use \n for newlines within snippet strings
    '$0\n' +
    '{% end' + `${TagNames.NOTE}` + ' %}'
  );

  // Add documentation displayed to the user
  noteCompletion.documentation = new MarkdownString(
    "Inserts a `note` admonition block snippet.\n\n" +
    "- Use the block to highlight important notes or information.\n" +
    "- The `icon=false` attribute is optional; remove it if you want the default note icon (or if the tag doesn't support this attribute)."
  );

  // Set preselect and sortText properties
  noteCompletion.preselect = true;
  noteCompletion.sortText = 'AtcmplNoteTagSnippet'; // Custom sort text for specific ordering (e.g., grouping admonitions)

  return noteCompletion;
};