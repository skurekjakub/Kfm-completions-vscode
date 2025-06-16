import { TagNames } from "../../../../constants";
import { TagDefinition } from "../../types";
import { tocTagCompletion } from "./tocSnippet";

// --- Definition for toc tag ---
export const tocTagDefinition: TagDefinition = {
    tagName: TagNames.TOC,
    isPairTag: false,
    snippetProvider: tocTagCompletion,
    attributes: [
        {
            name: 'minHeadingLevel',
            required: false, // Optional based on description
            description: 'The minimum heading level to include in the table of contents (e.g., 2 for H2).',
            isPositional: false
            // Value is likely a number, but no specific completions defined here.
        },
        {
            name: 'maxHeadingLevel', // Optional named parameter
            required: false, // Optional based on description
            description: 'The maximum heading level to include in the table of contents (e.g., 3 for H3).',
            isPositional: false
            // Value is likely a number, but no specific completions defined here.
        }
    ]
};
