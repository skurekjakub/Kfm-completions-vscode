import { TagNames } from "../../../../constants";
import { TagDefinition } from "../../types";
import { getInpageLinkCompletions } from "./helpers";
import { inpageLinkCompletion } from "./inpageLinkSnippet";

export const inpageLinkTagDefinition: TagDefinition = {
    tagName: TagNames.INPAGE_LINK,
    isPairTag: false,
    snippetProvider: inpageLinkCompletion,
    attributes: [
        {
            name: 'anchor',
            required: true,
            description: 'The ID of the heading or anchor to link to on the current page (without "#").',
            isPositional: true,
            loadSupportedValues: async (document) => getInpageLinkCompletions(document)
        },
        {
            name: 'linkText',
            required: false,
            description: 'Optional text to display for the link. Defaults to the heading text if omitted.',
            omitValueSnippet: true,
            loadSupportedValues: async (document) => getInpageLinkCompletions(document)
        }
    ]
};
