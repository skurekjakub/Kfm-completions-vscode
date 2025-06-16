// In definitions/tagDefinitions.ts (or new definitions/status/types.ts)

import { TagNames } from "../../../../constants";
import { TagDefinition } from "../../types";
import { statusTagCompletion } from "./statusSnippet";

export const statusTagDefinition: TagDefinition = {
    tagName: TagNames.STATUS,
    isPairTag: false,
    snippetProvider: statusTagCompletion,
    attributes: [
        {
            name: 'text', // Conceptual name for the required positional parameter (<text>)
            required: true,
            description: 'The status text to display.',
            isPositional: true // Mark as positional
        },
        {
            name: 'bgcolor', // Optional named parameter
            required: false,
            description: 'Optional background color (CSS color value or variable).',
            isPositional: false
        },
        {
            name: 'color', // Optional named parameter
            required: false,
            description: 'Optional text color (CSS color value or variable).',
            isPositional: false
        }
    ]
};
