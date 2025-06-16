// src/completions/rawTagCompletion.ts
import { CompletionItem, SnippetString, MarkdownString } from "vscode";
import { TagNames } from "../../../../constants";

export const rawTagCompletion = async () : Promise<CompletionItem> => {
  const rawCompletion = new CompletionItem(TagNames.RAW);

  // Define the snippet string - wraps selected text
  // Add $0 *after* the closing tag for the final cursor position
  rawCompletion.insertText = new SnippetString(
    '{% ' + `${TagNames.RAW}` + ' %}${TM_SELECTED_TEXT}$1{% end' + `${TagNames.RAW}` +' %}$0'
  );

  rawCompletion.documentation = new MarkdownString(
    `Surrounds selected text with {% ${TagNames.RAW} %}{% end${TagNames.RAW} %}.`
  );

  // Set preselect and sortText properties
  rawCompletion.preselect = true;
  rawCompletion.sortText = 'AtcmplRawTagSnippet';

  return rawCompletion;
};