// src/completions/gridTagCompletion.ts
import { CompletionItem, SnippetString, MarkdownString } from "vscode";
import { TagNames } from "../../../../constants"; // Assuming 'GRID' will be added to TagNames enum
import { SnippetProviderFn } from "../../types";

/**
 * Generates a completion item for the 'grid' block tag snippet.
 * This tag creates a layout grid container.
 */
export const gridTagCompletion: SnippetProviderFn = async () : Promise<CompletionItem> => {
  // Assumes GRID: 'grid' is added to the TagNames enum in constants.ts
  const gridCompletion = new CompletionItem(TagNames.GRID);

  // Define the snippet string with placeholders
  // $1: Number of columns (choice from 1 to 12)
  // $0: Cursor position for entering grid items
  const columnOptions = Array.from({ length: 12 }, (_, i) => i + 1).join(','); // "1,2,3,...,12"
  gridCompletion.insertText = new SnippetString(
    '{% ' + `${TagNames.GRID}` + ' columns="${1|' + columnOptions + '|}" %}\n' +
    '$0\n' +
    '{% end' + `${TagNames.GRID}` + ' %}'
  );

  // Add documentation displayed to the user
  gridCompletion.documentation = new MarkdownString(
    "Inserts a `grid` block tag for creating layout grids.\n\n" +
    "- `$1`: Select the number of columns (1-12) for the grid layout.\n" +
    "- Place `{% grid_item %}` blocks inside to define grid content."
  );

  // Set preselect and sortText properties
  gridCompletion.preselect = true;
  gridCompletion.sortText = 'AtcmplGridTagSnippet'; // Consistent sort text

  return gridCompletion;
};