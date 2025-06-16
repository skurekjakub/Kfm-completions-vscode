// src/completions/tableTagCompletion.ts
import { CompletionItem, SnippetString, MarkdownString } from "vscode";
import { TagNames } from "../../../../constants";
import { SnippetProviderFn } from "../../types";

/**
 * Generates a completion item for the 'table' block tag snippet.
 * This tag likely wraps standard table markup (e.g., Markdown).
 */
export const tableTagCompletion: SnippetProviderFn = async () : Promise<CompletionItem> => {
  const tableCompletion = new CompletionItem(TagNames.TABLE);

  // Define the snippet string with placeholders
  // $0: Cursor position for entering the table content
  tableCompletion.insertText = new SnippetString(
    '{% ' + `${TagNames.TABLE}` + ' %}\n' +
    '$0\n' + // Placeholder for table content (e.g., Markdown table)
    '{% end' + `${TagNames.TABLE}` + ' %}'
  );

  // Add documentation displayed to the user
  tableCompletion.documentation = new MarkdownString(
    "Inserts `table` start and end tags.\n\n" +
    "- Place your table content (e.g., using Markdown table syntax) between the tags."
  );

  // Set preselect and sortText properties
  tableCompletion.preselect = true;
  tableCompletion.sortText = 'AtcmplTableTagSnippet'; // Custom sort text for specific ordering

  return tableCompletion;
};