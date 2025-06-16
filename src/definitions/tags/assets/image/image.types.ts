import { TagNames } from "../../../../constants";
import { TagDefinition } from '../../types';
import { getAssetCompletionsForDocument } from '../helpers';
import { imageTagCompletion } from "./imageSnippet";

export const imageTagDefinition: TagDefinition = {
    tagName: TagNames.IMAGE,
    isPairTag: false,
    snippetProvider: imageTagCompletion,
    attributes: [
        {
            name: 'src', // Conceptual name for the required positional parameter ($1)
            required: true,
            description: 'The image source (asset ID, relative path, or URL).',
            isPositional: true, // Mark as positional
            loadSupportedValues: async (document) => getAssetCompletionsForDocument(document)
        },
        {
            name: 'title', // Optional named parameter ($2)
            required: true,
            description: 'Optional title attribute text (tooltip/accessibility).',
            isPositional: false
        },
        {
            name: 'width', // Optional named parameter ($3)
            required: false,
            description: 'Optional width specification (e.g., "150px", "100%").',
            isPositional: false
        },
        {
            name: 'border', // Optional named parameter ($4)
            required: false,
            description: 'Adds a border around the image.',
            isPositional: false,
            values: ['true', 'false'], // It likely behaves like a boolean
            omitValueSnippet: true // Suggest just 'border', not 'border="true"'
        }
    ]
};
