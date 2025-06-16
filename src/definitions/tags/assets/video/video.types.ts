import { TagNames } from '../../../../constants';
import { TagDefinition } from '../../types';
import { getAssetCompletionsForDocument } from '../helpers';
import { videoTagCompletion } from './videoSnippet';

// --- Definition for video tag ---
export const videoTagDefinition: TagDefinition = {
    tagName: TagNames.VIDEO,
    isPairTag: false,
    snippetProvider: videoTagCompletion,
    attributes: [
        {
            name: 'src', // Conceptual name for the required positional parameter ($1)
            required: true,
            description: 'The video source (asset ID, relative path, or URL).',
            isPositional: true, // Mark as positional
            loadSupportedValues: async (document) => getAssetCompletionsForDocument(document)
        },
        {
            name: 'width', // Optional named parameter ($2)
            required: false,
            description: 'Optional width specification (e.g., "640px", "100%").',
            isPositional: false
        },
        {
            name: 'height', // Optional named parameter ($3)
            required: false,
            description: 'Optional height specification (e.g., "360px", "auto").',
            isPositional: false
        }
    ]
};
