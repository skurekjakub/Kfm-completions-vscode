import { TagDefinition } from "../../types";
import { TagNames } from "../../../../constants";
import { getIconCompletions } from "./helpers";
import { iconTagCompletion } from "./iconSnippet";

export const iconTagDefinition: TagDefinition = {
  tagName: TagNames.ICON,
  isPairTag: false,
  snippetProvider: iconTagCompletion,
  attributes: [
      {
          name: 'iconName', // Conceptual name for positional icon ID
          required: true,
          description: 'The icon identifier.',
          isPositional: true,
          loadSupportedValues: async () => getIconCompletions() // Assign loader function
      },
      { name: 'color', required: true, description: '...', isPositional: false } // Assuming color required
  ]
};
