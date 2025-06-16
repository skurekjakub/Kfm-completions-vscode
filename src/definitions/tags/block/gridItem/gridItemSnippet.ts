// src/completions/gridItemTagCompletion.ts
import { CompletionItem, SnippetString, MarkdownString } from "vscode";
import { TagNames } from "../../../../constants";
import { SnippetProviderFn } from "../../types";

/**
 * Generates a completion item for the 'grid_item' block tag snippet.
 * This tag defines an item within a 'grid' container.
 */
export const gridItemTagCompletion: SnippetProviderFn = async () : Promise<CompletionItem> => {
  const gridItemCompletion = new CompletionItem(TagNames.GRID_ITEM);

  // Define the snippet string with placeholders
  // $0: Cursor position for entering the content of the grid item
  gridItemCompletion.insertText = new SnippetString(
    '{% ' + `${TagNames.GRID_ITEM}` + ' %}\n' +
    '$0\n' + // Indent placeholder for item content
    '{% end' + `${TagNames.GRID_ITEM}` + ' %}'
  );

  // Add documentation displayed to the user
  gridItemCompletion.documentation = new MarkdownString(
    "Inserts a `grid_item` block tag, used inside a `{% grid %}` block.\n\n" +
    "- Place the content for a single grid cell within these tags."
  );

  // Set preselect and sortText properties
  gridItemCompletion.preselect = true;
  gridItemCompletion.sortText = 'AtcmplGridItemTagSnippet'; // Consistent sort text

  return gridItemCompletion;
};