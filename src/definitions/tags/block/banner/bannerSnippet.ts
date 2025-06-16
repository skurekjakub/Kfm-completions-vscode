// src/completions/bannerTagCompletion.ts
import { CompletionItem, SnippetString, MarkdownString } from "vscode";
import { TagNames } from "../../../../constants";
import { SnippetProviderFn } from "../../types";

/**
 * Generates a completion item for the 'banner' block tag snippet.
 * This tag creates a prominent banner block, often used for introductions or key messages.
 */
export const bannerTagCompletion: SnippetProviderFn = async () : Promise<CompletionItem> => {
  // Assumes BANNER: 'banner' is added to the TagNames enum in constants.ts
  const bannerCompletion = new CompletionItem(TagNames.BANNER);

  // Define the snippet string with placeholders
  // $1: The title text for the banner
  // $0: Cursor position for entering the banner's main content
  bannerCompletion.insertText = new SnippetString(
    '{% ' + `${TagNames.BANNER}` + ' title="$1" %}\n' +
    '$0\n' + // Placeholder for the banner content
    '{% end' + `${TagNames.BANNER}` + ' %}'
  );

  // Add documentation displayed to the user
  bannerCompletion.documentation = new MarkdownString(
    "Inserts a `banner` block tag.\n\n" +
    "- Use this tag to create a visually distinct banner, often at the top of a page.\n" +
    "- `$1`: Set the mandatory title displayed prominently in the banner."
  );

  // Set preselect and sortText properties
  bannerCompletion.preselect = true;
  bannerCompletion.sortText = 'AtcmplBannerTagSnippet'; // Consistent sort text

  return bannerCompletion;
};