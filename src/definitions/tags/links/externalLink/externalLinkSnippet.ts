// src/completions/externalLinkCompletion.ts
import { CompletionItem, SnippetString, MarkdownString } from "vscode";
import { TagNames } from "../../../../constants";
import { SnippetProviderFn } from "../../types";

export const externalLinkCompletion: SnippetProviderFn = async () : Promise<CompletionItem> => {
const externalLinkCompletion = new CompletionItem(TagNames.EXTERNAL_LINK);

  // Define the snippet string with placeholders
  externalLinkCompletion.insertText = new SnippetString(
    '{% ' + `${TagNames.EXTERNAL_LINK}` + ' $1${2: linkText=\"${3:(optional)}\"} %} $0'
  );

  externalLinkCompletion.documentation = new MarkdownString(
    "Inserts a tag that lets you link to an external URL."
  );

  // Set preselect and sortText properties
  externalLinkCompletion.preselect = true;
  externalLinkCompletion.sortText = 'AtcmplExternalLinkSnippet'; // Or keep 'AtcmplSnippet'

  return externalLinkCompletion;
};