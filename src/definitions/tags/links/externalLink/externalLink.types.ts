// In definitions/tagDefinitions.ts (or new definitions/links/types.ts)

import { TagNames } from "../../../../constants";
import { TagDefinition } from "../../types";
import { externalLinkCompletion } from "./externalLinkSnippet";

// --- Definition for external_link tag ---
export const externalLinkTagDefinition: TagDefinition = {
    tagName: TagNames.EXTERNAL_LINK,
    isPairTag: false,
    snippetProvider: externalLinkCompletion,
    attributes: [
        {
            name: 'url', // Conceptual name for the required positional parameter ($1)
            required: true,
            description: 'The target external URL (e.g., "https://example.com").',
            isPositional: true // Mark as positional
            // No specific value completions needed for arbitrary URLs
        },
        {
            name: 'linkText', // The optional named parameter ($2)
            required: false,
            description: 'Optional text to display for the link.',
            isPositional: false
        },
        {
            name: 'target',
            required: false,
            description: 'The target where the window opens.',
            isPositional: false,
            values: ['_self', '_blank']
        }
    ]
};
