// src/completions/videoTagCompletion.ts
import { CompletionItem, SnippetString, MarkdownString } from "vscode";
import { TagNames } from "../../../../constants";
import { SnippetProviderFn } from "../../types";

/**
 * Generates a completion item for the 'video' tag snippet.
 * This tag allows embedding videos into the content.
 */
export const videoTagCompletion: SnippetProviderFn = async () : Promise<CompletionItem> => {
  const videoCompletion = new CompletionItem(TagNames.VIDEO);

  // Define the snippet string with placeholders
  // $1: Video source (e.g., URL, asset ID, path)
  // $2: Width specification (e.g., "640px", "100%")
  // $3: Height specification (e.g., "360px", "auto")
  // Original snippet '{% video $1${2: width="$3"}${4: height="$5"} %}"' had syntax issues
  // and unusual optional attribute structure. Refined for clarity:
  videoCompletion.insertText = new SnippetString(
    '{% ' + `${TagNames.VIDEO}` + ' $1 width="${2:100%}" height="${3:auto}" %} $0'
    // Using common defaults/placeholders like "100%" and "auto"
  );

  // Add documentation displayed to the user
  // Corrected documentation from "file tag" to "video tag"
  videoCompletion.documentation = new MarkdownString(
    "Inserts a video tag snippet for embedding videos.\n\n" +
    "- `$1`: Specify the video source (URL, asset ID, or path).\n" +
    "- `$2`: Set the display width (e.g., `640px`, `100%`). Default: `100%`.\n" +
    "- `$3`: Set the display height (e.g., `360px`, `auto`). Default: `auto`."
  );

  // Set preselect and sortText properties
  videoCompletion.preselect = true;
  videoCompletion.sortText = 'AtcmplVideoTagSnippet'; // Custom sort text for specific ordering

  return videoCompletion;
};