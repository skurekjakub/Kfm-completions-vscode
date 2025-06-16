import { TagNames } from "../../../../constants";
import { getCardMediaCompletions, getCardTagIconCompletions } from "../../../../logic/filesystem/workspaceFileLoader";
import { TagDefinition } from "../../types"; // Import base TagDefinition type
import { cardTagCompletion } from "./cardSnippet";
import { validateCardIconImageConflict } from "./diagnostics/imageAttrConflict";

// --- Define the Card Tag ---

export const cardTagDefinition: TagDefinition = {
  tagName: TagNames.CARD,
  isPairTag: true,
  snippetProvider: cardTagCompletion,
  attributes: [
    { name: 'title', required: true, description: 'The main title of the card.' },
    { name: 'link', required: true, description: 'The URL the card links to.' },
    {
      name: 'image',
      required: false,
      description: 'Image asset identifier (cannot be used with icon). Add new header images under "src/_assets/svg/card-media"',
      loadSupportedValues: async () => getCardMediaCompletions()
    },
    {
      name: 'icon',
      required: false,
      description: 'Tag icon identifier (cannot be used with image). Add new icons under "src/_assets/svg/tag"',
      loadSupportedValues: async () => getCardTagIconCompletions()
    }
  ],
  validationRules: [
      validateCardIconImageConflict
  ]
};