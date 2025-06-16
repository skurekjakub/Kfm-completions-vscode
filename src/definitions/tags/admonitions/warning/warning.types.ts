import { TagNames } from "../../../../constants";
import { TagDefinition } from "../../types";
import { getWarningBlockDecorations } from "./warningDecorations";
import { warningTagCompletion } from "./warningSnippet";

// --- Definition for note tag ---
export const warningTagDefinition: TagDefinition = {
    tagName: TagNames.WARNING,
    snippetProvider: warningTagCompletion,
    isPairTag: true,
    decorationProviders: [
        {
            decorationTypeName: "warningBlockBorder",
            provider: getWarningBlockDecorations
        }
    ],
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
