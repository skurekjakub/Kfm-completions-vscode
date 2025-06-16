import { TagNames } from "../../../../constants";
import { TagDefinition } from "../../types";
import { noteTagCompletion } from "./noteSnippet";

// --- Definition for note tag ---
export const noteTagDefinition: TagDefinition = {
    tagName: TagNames.NOTE,
    snippetProvider: noteTagCompletion,
    isPairTag: true,
    attributes: [
        {
            name: 'icon', // Optional named parameter
            required: false,
            description: 'Set to "false" to hide the default icon for the admonition.',
            isPositional: false,
            values: ['true', 'false'],
            omitValueSnippet: true
        }
        // NOTE: Admonitions also have content, but we don't define 'content' as an attribute.
    ]
};
