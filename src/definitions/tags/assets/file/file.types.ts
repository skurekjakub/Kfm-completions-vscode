// Import the function providing asset completions (adjust path as needed)
import { getAssetCompletionsForDocument } from '../helpers';
import { TagDefinition } from '../../types';
import { TagNames } from '../../../../constants';
import { fileTagCompletion } from './fileSnippet';

// --- Definition for file tag ---
export const fileTagDefinition: TagDefinition = {
    tagName: TagNames.FILE,
    isPairTag: false,
    snippetProvider: fileTagCompletion,
    attributes: [
        {
            name: 'src', // Conceptual name for the required positional parameter ($1)
            required: true,
            description: 'The file source (asset ID, relative path, or URL).',
            isPositional: true, // Mark as positional
            loadSupportedValues: async (document) => getAssetCompletionsForDocument(document) // Function to load asset suggestions
        },
        {
            name: 'disposition', // The optional named parameter ($2)
            required: false,
            description: 'How the browser should handle the link (download or display inline).',
            isPositional: false,
            values: ['download', 'inline'] // Predefined values
            // Doesn't need omitValueSnippet: true because value should be quoted
        }
    ]
};
