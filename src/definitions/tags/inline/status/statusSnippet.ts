// logic/snippets/templates/admonitions/status_tag.ts
import { CompletionItem, SnippetString, MarkdownString } from "vscode";
import { TagNames } from "../../../../constants";
import { SnippetProviderFn } from "../../types";

/**
 * Generates a completion item for the 'status' tag snippet.
 * Renders a status text with optional background and text colors.
 */
export const statusTagCompletion: SnippetProviderFn = async () : Promise<CompletionItem> => {
  // Assumes STATUS = 'status' is added to the TagNames enum
  const statusCompletion = new CompletionItem(TagNames.STATUS);

  // Define the snippet string with placeholders based on TextMate snippet
  // {% status $1${2: bgcolor="$3"}${4: color="$5"} %}$0
  // $1: Required status text
  // $2/$3: Optional bgcolor attribute and value
  // $4/$5: Optional color attribute and value
  // $0: Final cursor position
  statusCompletion.insertText = new SnippetString(
    '{% ' + `${TagNames.STATUS}` + ' "$1"${2: bgcolor="$3"}${4: color="$5"} %}$0'
  );

  // Add documentation displayed to the user
  statusCompletion.documentation = new MarkdownString(
    "Inserts a `status` tag snippet for displaying status text.\n\n" +
    "- `$1`: Enter the status text (e.g., ADDED, REMOVED, INFO).\n" +
    "- `$2` / `$3`: (Optional) Specify `bgcolor` (CSS color value) for the background.\n" +
    "- `$4` / `$5`: (Optional) Specify `color` (CSS color value) for the text."
  );

  // Set preselect and sortText properties
  statusCompletion.preselect = true; // Or false depending on preference
  statusCompletion.sortText = 'AtcmplStatusTagSnippet'; // Consistent sort text

  return statusCompletion;
};