import { TagNames } from "../../../../constants";
import { TagDefinition } from "../../types";
import { bannerTagCompletion } from "./bannerSnippet";

export const bannerTagDefinition: TagDefinition = {
    tagName: TagNames.BANNER,
    isPairTag: true,
    snippetProvider: bannerTagCompletion,
    attributes: [
        {
            name: 'variant', // Conceptual name for the optional positional parameter (<variant>)
            required: false, // It's optional according to the syntax
            description: 'Optional display variant for the banner. Defaults to primary.',
            isPositional: true, // Mark as positional (comes before named attributes)
            values: ['primary', 'secondary'] // Predefined values based on RENDER_STATES
        },
        {
            name: 'title', // The required named parameter
            required: true,
            description: 'The title displayed prominently in the banner.',
            isPositional: false // It's a named attribute (title=...)
            // No predefined values or special value loader needed for title
        }
        // NOTE: Banners also have content, but we don't define 'content' as an attribute.
    ]
};
