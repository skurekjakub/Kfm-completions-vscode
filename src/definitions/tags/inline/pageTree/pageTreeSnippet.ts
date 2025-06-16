// src/completions/pageTreeTagCompletion.ts
import { CompletionItem, SnippetString, MarkdownString } from "vscode";
import { TagNames } from "../../../../constants";

/**
 * Generates a completion item for the 'page_tree' tag snippet.
 * This tag renders a navigation tree of child pages relative to the current page.
 */
export const pageTreeTagCompletion = async () : Promise<CompletionItem> => {
  const pageTreeCompletion = new CompletionItem(TagNames.PAGE_TREE);

  // Define the snippet string with placeholders
  // $0: Final cursor position after the tag
  pageTreeCompletion.insertText = new SnippetString(
    '{% ' + `${TagNames.PAGE_TREE}` + ' %}$0'
  );

  // Add documentation displayed to the user
  pageTreeCompletion.documentation = new MarkdownString(
    "Renders a page tree (navigation) rooted at the current page.\n\n" +
    "**Note:** This tag can typically only be used once per page."
  );

  // Set preselect and sortText properties
  pageTreeCompletion.preselect = true;
  pageTreeCompletion.sortText = 'AtcmplPageTreeTagSnippet'; // Custom sort text for specific ordering

  return pageTreeCompletion;
};