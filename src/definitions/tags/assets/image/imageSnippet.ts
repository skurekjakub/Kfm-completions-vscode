// src/completions/imageTagCompletion.ts
import { CompletionItem, SnippetString, MarkdownString } from "vscode";
import { TagNames } from "../../../../constants";
import { SnippetProviderFn } from "../../types";

/**
 * Generates a completion item for the 'image' tag snippet.
 * This tag allows embedding images into the content.
 */
export const imageTagCompletion: SnippetProviderFn = async () : Promise<CompletionItem> => {
  const imageCompletion = new CompletionItem(TagNames.IMAGE);

  // Define the snippet string with placeholders
  // $1: Image source (e.g., URL, asset ID, path)
  // $2: Title attribute text (often for hover tooltips, accessibility)
  // $3: Width specification (e.g., "100px", "50%")
  // $4: Optional border attribute (e.g., border=true)
  imageCompletion.insertText = new SnippetString(
    '{% ' + `${TagNames.IMAGE}` + ' $1 title="$2" width="$3"${4: border=true} %} $0'
    // Note: The final $0 places the cursor after the tag
  );

  // Add documentation displayed to the user
  imageCompletion.documentation = new MarkdownString(
    "Inserts an image tag snippet.\n\n" +
    "- `$1`: Specify the image source (URL, asset ID, or path).\n" +
    "- `$2`: Set the title attribute (tooltip text).\n" +
    "- `$3`: Define the image width (e.g., `150px`, `100%`).\n" +
    "- `$4`: (Optional) Add `border=true` to include a border (or adjust as needed based on tag implementation)."
  );

  // Set preselect and sortText properties
  imageCompletion.preselect = true;
  imageCompletion.sortText = 'AtcmplImageTagSnippet'; // Custom sort text for specific ordering

  return imageCompletion;
};