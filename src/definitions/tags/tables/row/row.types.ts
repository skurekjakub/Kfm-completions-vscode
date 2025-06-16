import { TagNames } from "../../../../constants";
import { TagDefinition } from "../../types";
import { rowTagCompletion } from "./rowSnippet";

// --- Definition for row tag ---
export const rowTagDefinition: TagDefinition = {
    tagName: TagNames.ROW,
    isPairTag: true,
    snippetProvider: rowTagCompletion,
    allowedParents: [TagNames.TABLE],
    attributes: [
        {
            name: 'header', // The required named parameter ($1)
            required: false,
            description: 'Indicates if this is a header row (`true`) or a standard data row (`false`).',
            isPositional: false,
            values: ['true', 'false'] // Predefined boolean-like values
        },
        {
            name: 'secondaryHeader',
            required: false,
            description: 'Indicates if this is a header row (`true`) or a standard data row (`false`). Used when more than one header is required for a single table. Ensures that the generated HTML adheres to the HTML5 specification.',
            isPositional: false,
            values: ['true', 'false']
        }
        // NOTE: Rows also wrap content ({% cell %}), but we don't define 'content' as an attribute.
    ]
};
