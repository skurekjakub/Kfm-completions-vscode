// src/completions/cellTagCompletion.ts
import { CompletionItem, SnippetString, MarkdownString } from "vscode";
import { TagNames } from "../../../../constants";

/**
 * Generates a completion item for the 'cell' block tag snippet.
 * This tag is likely used within a 'row' block to define table cell content.
 */
export const cellTagCompletion = async () : Promise<CompletionItem> => {
  const cellCompletion = new CompletionItem(TagNames.CELL);

  // Define the snippet string with placeholders
  // ${TM_SELECTED_TEXT}: Wraps any selected text with the tags.
  // $0: Final cursor position inside the cell (after selected text).
  // Note: The '\n' before {% endcell %} might add extra whitespace depending on renderer.
  // If cells are typically single-line, consider removing the '\n'.
  cellCompletion.insertText = new SnippetString(
    '{% ' + `${TagNames.CELL}` + ' %}${TM_SELECTED_TEXT}$0\n{% end' + `${TagNames.CELL}` + ' %}'
  );

  // Add documentation displayed to the user
  cellCompletion.documentation = new MarkdownString(
    "Inserts `cell` start and end tags, used within a `{% row %}` block to define table cell content.\n\n" +
    "- Wraps currently selected text.\n" +
    "- Place the content for a single table cell between the tags."
  );

  // Set preselect and sortText properties
  cellCompletion.preselect = true;
  cellCompletion.sortText = 'AtcmplCellTagSnippet'; // Custom sort text for specific ordering (e.g., grouping with table/row)

  return cellCompletion;
};