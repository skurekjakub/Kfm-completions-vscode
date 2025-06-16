// src/completions/rowTagCompletion.ts
import { CompletionItem, SnippetString, MarkdownString } from "vscode";
import { TagNames } from "../../../../constants";
import { SnippetProviderFn } from "../../types";

/**
 * Generates a completion item for the 'row' block tag snippet.
 * This tag is likely used within a 'table' block to define a table row.
 */
export const rowTagCompletion: SnippetProviderFn = async () : Promise<CompletionItem> => {
  const rowCompletion = new CompletionItem(TagNames.ROW);

  // Define the snippet string with placeholders
  // $1: Choice for the 'header' attribute (true if header row, false if data row)
  // $0: Cursor position for entering cell content within the row
  // Original snippet: '{% row ${1: header=\"${2:(true/false)}\"} %}\n$0\n{% endrow %}'
  // Refined for clarity and usability:
  rowCompletion.insertText = new SnippetString(
    '{% ' + `${TagNames.ROW}` + ' header="${1|false,true|}" %}\n' + // Defaults to 'false', offers 'true' as choice
    '\t$0\n' +                               // Indent content placeholder
    '{% end' + `${TagNames.ROW}` + ' %}'
  );

  // Add documentation displayed to the user
  rowCompletion.documentation = new MarkdownString(
    "Inserts `row` start and end tags, used within a `{% table %}` block.\n\n" +
    "- Set the `header` attribute:\n" +
    "  - `true`: Marks this row as a header row.\n" +
    "  - `false`: Marks this row as a standard data row.\n" +
    "- Place cell content (e.g., using Markdown table cell syntax or `{% cell %}` tags) between the `{% row %}` and `{% endrow %}` tags."
  );

  // Set preselect and sortText properties
  rowCompletion.preselect = true;
  rowCompletion.sortText = 'AtcmplRowTagSnippet'; // Custom sort text for specific ordering (e.g., grouping with table/cell)

  return rowCompletion;
};