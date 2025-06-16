import { TagDefinition } from "../../types";
import { TagNames } from "../../../../constants";
import { getPageLinkCompletions, getAnchorCompletions } from "./helpers";
import { pagelinkCompletion } from "./pageLinkSnippet";

export const pageLinkTagDefinition: TagDefinition = {
    tagName: TagNames.PAGE_LINK,
    isPairTag: false,
    snippetProvider: pagelinkCompletion,
    attributes: [
        {
            name: 'pageId', // Conceptual name for the required positional parameter ($1)
            required: true,
            description: 'The unique identifier of the target page.',
            isPositional: true, // Mark as positional
            loadSupportedValues: async (document) => getPageLinkCompletions(document)
        },
        {
            name: 'linkText', // The optional named parameter ($2)
            required: false,
            description: 'Optional text to display for the link. Defaults to selected text or target page title.',
            isPositional: false
        },
        {
            name: 'collection', // The optional collection attribute
            required: false,
            description: 'Specify the collection ID if the target page is in a different collection. Often added automatically by completions.',
            isPositional: false
        },
        {
            name: 'anchor', // The optional anchor attribute
            required: false,
            description: 'Specify the name of the target anchor, if deep linking.',
            isPositional: false,
            loadSupportedValues: async (document, position, tagContext, attrDef, currentAttributes) => getAnchorCompletions(currentAttributes['argv1'])
        },
        {
            name: 'suppress_warnings',
            required: false,
            description: 'Supress page_link warnings about e.g., links leading to disabled collections when building the project locally',
            isPositional: false,
            values: ['true', false],
            omitValueSnippet: true
        }
    ]
};
