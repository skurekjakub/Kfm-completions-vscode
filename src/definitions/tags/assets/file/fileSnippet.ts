// src/completions/fileTagCompletion.ts
import { CompletionItem, SnippetString, MarkdownString } from "vscode";
import { TagNames } from "../../../../constants";
import { SnippetProviderFn } from "../../types";

/**
 * Generates a completion item for the 'file' tag snippet.
 * This tag typically creates a link to a downloadable or viewable file.
 */
export const fileTagCompletion: SnippetProviderFn = async () : Promise<CompletionItem> => {
  const fileCompletion = new CompletionItem(TagNames.FILE);

  // Define the snippet string with placeholders
  // $1: File source (e.g., URL, asset ID, path)
  // $2: Disposition ('download' or 'inline') - determines if the file link prompts download or attempts to display inline
  fileCompletion.insertText = new SnippetString(
    '{% ' + `${TagNames.FILE}` + ' $1 disposition="${2|download,inline|}" %} $0'
     // Using ${2|download,inline|} provides choices in the snippet.
     // If only 'download' is valid, use: '{% file $1 disposition="download" %} $0'
     // Or if it's free text: '{% file $1 disposition="$2" %} $0'
     // Original had syntax issue: '{% file $1 disposition="${2:download} %}"' - corrected here.
  );

  // Add documentation displayed to the user
  fileCompletion.documentation = new MarkdownString(
    "Inserts a file tag snippet, typically for creating a file link.\n\n" +
    "- `$1`: Specify the file source (URL, asset ID, or path).\n" +
    "- `$2`: Set the `disposition`. Common values:\n" +
    "  - `download`: Prompts the user to download the file.\n" +
    "  - `inline`: Attempts to display the file directly in the browser (if supported)."
  );

  // Set preselect and sortText properties
  fileCompletion.preselect = true;
  fileCompletion.sortText = 'AtcmplFileTagSnippet'; // Custom sort text for specific ordering

  return fileCompletion;
};