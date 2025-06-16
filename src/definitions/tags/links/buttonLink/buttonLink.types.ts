import { TagNames } from '../../../../constants';
import { getIconCompletions } from '../../inline/icon/helpers';
import { TagDefinition } from '../../types';
import { buttonLinkCompletion } from './buttonLinkSnippet';

// --- Definition for button_link tag ---
export const buttonLinkTagDefinition: TagDefinition = {
    tagName: TagNames.BUTTON_LINK,
    isPairTag: false,
    snippetProvider: buttonLinkCompletion,
    attributes: [
        {
            name: 'url', // Conceptual name for the required positional parameter ($1)
            required: true,
            description: 'The target URL for the button link.',
            isPositional: true, // Mark as positional
            values: ['<URL(required)>']
        },
        {
            name: 'buttonIcon', // Optional named parameter ($2)
            required: false,
            description: 'Optional icon identifier (e.g., from xp-icon-variables.less) to display on the button.',
            isPositional: false,
            loadSupportedValues: async () => getIconCompletions()
        },
        {
            name: 'buttonLabel', // Required named parameter ($3)
            required: true,
            description: 'The text label displayed on the button.',
            isPositional: false
        }
    ]
};
