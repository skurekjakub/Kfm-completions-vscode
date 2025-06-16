import { CompletionItem, SnippetString, MarkdownString } from "vscode";
import { TagNames } from "../../../../constants";
import { SnippetProviderFn } from "../../types";

export const cardTagCompletion: SnippetProviderFn = async () : Promise<CompletionItem> => {
  const cardCompletion = new CompletionItem(TagNames.CARD); // Use 'card_tag' label and Snippet kind

  // Define the snippet string with placeholders
  cardCompletion.insertText = new SnippetString(
      '{% ' + `${TagNames.CARD}` + ' title="$1" link="$2" image="$3" icon="$4" %}\n' + // Start tag with placeholders for attributes
      '${TM_SELECTED_TEXT}$0\n' +                    // Placeholder for content (includes selected text) and final cursor stop
      '{% endcard %}\n'                                // End tag
  );

  cardCompletion.documentation = new MarkdownString("Inserts a card snippet with title, link, and imageORicon attributes. Only one of the image/icon attributes can be specified");

  // Keep preselect and sortText consistent if desired
  cardCompletion.preselect = true;
  cardCompletion.sortText = 'AtcmplCardTagSnippet';

  return cardCompletion;
};