// src/completions/buttonLinkCompletion.ts
import { CompletionItem, SnippetString, MarkdownString } from "vscode";
import { TagNames } from "../../../../constants";
import { SnippetProviderFn } from "../../types";
/**
 * Generates a completion item for the 'button_link' tag snippet.
 * This tag allows linking to any URL using a button style.
 */
export const buttonLinkCompletion: SnippetProviderFn = async () : Promise<CompletionItem> => {
  const buttonLinkCompletion = new CompletionItem(TagNames.BUTTON_LINK);

  // Define the snippet string with placeholders
  // $1: URL
  // $2: Icon name (optional, defaults or specific guidance needed)
  // $3: Button label text
  buttonLinkCompletion.insertText = new SnippetString(
    '{% ' + `${TagNames.BUTTON_LINK}` + ' $1 buttonIcon="${2:icon from \'xp-icon-variables.less\'}" buttonLabel="$3" %} $0'
  );

  // Add documentation displayed to the user
  buttonLinkCompletion.documentation = new MarkdownString(
    "Inserts a tag that lets you link to any URL using a button.\n\n" +
    "- `$1`: The target URL.\n" +
    "- `$2`: (Optional) The icon identifier (e.g., from `xp-icon-variables.less`).\n" +
    "- `$3`: The text label displayed on the button."
  );

  // Set preselect and sortText properties
  buttonLinkCompletion.preselect = true;
  buttonLinkCompletion.sortText = 'AtcmplButtonLinkSnippet'; // Custom sort text for specific ordering

  return buttonLinkCompletion;
};