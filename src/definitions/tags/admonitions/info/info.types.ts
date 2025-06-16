import { TagNames } from "../../../../constants";
import { TagDefinition } from "../../types";
import { infoTagCompletion } from "./infoSnippet";

// --- Definition for info tag ---
export const infoTagDefinition: TagDefinition = {
    tagName: TagNames.INFO,
    snippetProvider: infoTagCompletion,
    isPairTag: true,
    attributes: [
        {
            name: 'icon', // Optional named parameter ($1 controls presence of icon=false)
            required: false,
            description: 'Set to "false" to hide the default icon for the admonition.',
            isPositional: false,
            values: ['true', 'false'], // Likely boolean behaviour
            omitValueSnippet: true // Suggest just 'icon', its presence implies 'true' usually
        }
        // NOTE: Admonitions also have content, but we don't define 'content' as an attribute.
    ]
};