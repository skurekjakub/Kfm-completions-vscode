// src/completions/iconTagCompletion.ts
import { CompletionItem, SnippetString, MarkdownString } from "vscode";
import { TagNames } from "../../../../constants";
import { SnippetProviderFn } from "../../types";

/**
 * Generates a completion item for the 'icon' tag snippet.
 * This tag inserts a specific icon inline.
 */
export const iconTagCompletion: SnippetProviderFn = async () : Promise<CompletionItem> => {
  const iconCompletion = new CompletionItem(TagNames.ICON);

  // Define the snippet string with placeholders
  // $1: Icon name/identifier
  // $2: Color value (e.g., 'red', '#FF0000', variable name)
  // $0: Final cursor position after the tag
  iconCompletion.insertText = new SnippetString(
    '{% ' + `${TagNames.ICON}` + ' $1 color="$2" %}$0'
  );

  // Add documentation displayed to the user
  iconCompletion.documentation = new MarkdownString(
    "Inserts an inline icon.\n\n" +
    "- `$1`: Specify the icon name or identifier (e.g., `info-circle`, `warning-sign`). Refer to project documentation for available icons.\n" +
    "- `$2`: Set the icon color (e.g., standard color name `red`, hex code `#FF5733`, or a theme color variable)."
  );

  // Set preselect and sortText properties
  iconCompletion.preselect = true;
  iconCompletion.sortText = 'AtcmplIconTagSnippet'; // Custom sort text for specific ordering

  return iconCompletion;
};