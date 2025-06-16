// src/completions/panelTagCompletion.ts
import { CompletionItem, SnippetString, MarkdownString } from "vscode";
import { TagNames } from "../../../../constants";
import { SnippetProviderFn } from "../../types";

/**
 * Generates a completion item for the 'panel' block tag snippet.
 * This tag creates a styled panel to highlight the content within it.
 */
export const panelTagCompletion: SnippetProviderFn = async () : Promise<CompletionItem> => {
  const panelCompletion = new CompletionItem(TagNames.PANEL);

  // Define the snippet string with placeholders
  // $0: Cursor position for entering the panel content
  panelCompletion.insertText = new SnippetString(
    '{% ' + `${TagNames.PANEL}` + ' %}\n' +
    '$0\n' + // Placeholder for the content to be highlighted
    '{% end' + `${TagNames.PANEL}` + ' %}'
  );

  // Add documentation displayed to the user
  panelCompletion.documentation = new MarkdownString(
    "Inserts a `panel` block tag.\n\n" +
    "- Use this tag to visually group and highlight the surrounded text or content within a distinct panel."
  );

  // Set preselect and sortText properties
  panelCompletion.preselect = true;
  panelCompletion.sortText = 'AtcmplPanelTagSnippet'; // Custom sort text for specific ordering

  return panelCompletion;
};