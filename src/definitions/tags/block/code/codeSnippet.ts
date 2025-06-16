// src/completions/codeTagCompletion.ts
import { CompletionItem, SnippetString, MarkdownString } from "vscode";
import { LANGS, TagNames } from "../../../../constants";
import { SnippetProviderFn } from "../../types";

/**
 * Generates a completion item for the 'code' tag snippet.
 * This tag allows embedding formatted code blocks.
 */
export const codeTagCompletion: SnippetProviderFn = async () : Promise<CompletionItem> => {
  const codeCompletion = new CompletionItem(TagNames.CODE);

  // Build the language selection part of the snippet dynamically
  const languageOptions = LANGS.join(',');

  // Define the snippet string with placeholders
  // $1: Language identifier (selected from LANGS)
  // $2: Title for the code block (optional)
  // $0: Final cursor position (inside the code block)
  codeCompletion.insertText = new SnippetString(
    '{% ' + `${TagNames.CODE}` + ' lang=${1|' + languageOptions + '|} title=\"$2\" %}\r\n' +
    '$0\r\n' +
    '{% end' + `${TagNames.CODE}` + ' %}\r\n\r\n'
  );

  // Add documentation displayed to the user
  codeCompletion.documentation = new MarkdownString(
    "Inserts a code block snippet.\n\n" +
    "- `$1`: Select the programming language for syntax highlighting.\n" +
    "- `$2`: (Optional) Provide a title for the code block.\n" +
    "- Enter your code between the `{% code %}` and `{% endcode %}` tags."
  );

  // Set preselect and sortText properties
  codeCompletion.preselect = true;
  codeCompletion.sortText = 'AtcmplCodeTagSnippet'; // Custom sort text

  return codeCompletion;
};