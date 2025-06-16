// src/completions/inpageLinkCompletion.ts
import { CompletionItem, SnippetString, MarkdownString } from "vscode";
import { TagNames } from "../../../../constants"; // Adjust path if needed based on your file structure
import { SnippetProviderFn } from "../../types";

export const inpageLinkCompletion: SnippetProviderFn = async () : Promise<CompletionItem> => {
  const inPagelinkCompletion = new CompletionItem(TagNames.INPAGE_LINK);

  inPagelinkCompletion.insertText = new SnippetString(
    '{% ' + `${TagNames.INPAGE_LINK}` + ' $1${2: linkText=\"${3:(optional)}\"} %} $0'
  );

  inPagelinkCompletion.documentation = new MarkdownString(
    "Inserts a tag that lets you link to an anchor on the current page."
  );

  // Set preselect and sortText properties
  inPagelinkCompletion.preselect = true;
  inPagelinkCompletion.sortText = 'AtcmplInpageLinkSnippet'; // Or keep 'AtcmplSnippet' if preferred

  return inPagelinkCompletion;
};