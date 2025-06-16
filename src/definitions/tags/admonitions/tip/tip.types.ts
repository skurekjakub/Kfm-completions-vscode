import { TagNames } from "../../../../constants";
import { TagDefinition } from "../../types";
import { tipTagCompletion } from "./tipSnippet";

// --- Definition for note tag ---
export const tipTagDefinition: TagDefinition = {
    tagName: TagNames.TIP,
    isPairTag: true,
    snippetProvider: tipTagCompletion,
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
