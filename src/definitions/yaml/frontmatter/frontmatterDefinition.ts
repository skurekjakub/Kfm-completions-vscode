import { AttributeDataType } from "../../common/types";
import { YamlObjectDefinition } from "../types";

/**
 * Definition for the 'frontmatter' object found within 'page' or 'subpages'.
 * Allows overriding standard Markdown frontmatter.
 */
export const frontmatterObjectDefinition: YamlObjectDefinition = {
    id: 'module:frontmatter',
    allowUnknownKeys: true, // Frontmatter is often flexible
    attributes: [
        {
            name: 'title',
            required: false,
            description: 'Overrides the page/subpage title.',
            dataType: AttributeDataType.String
        },
        {
            name: 'toc',
            required: false,
            description: 'Table of Contents configuration.',
            dataType: AttributeDataType.Object,
            objectDefinition: { // Nested object definition for 'toc'
                id: 'module:frontmatter:toc',
                attributes: [
                    { name: 'minHeadingLevel', required: false, description: 'Minimum heading level to include (e.g., 2 for ##).', dataType: AttributeDataType.Number, values: [1, 2, 3, 4, 5, 6] },
                    { name: 'maxHeadingLevel', required: false, description: 'Maximum heading level to include (e.g., 3 for ###).', dataType: AttributeDataType.Number, values: [1, 2, 3, 4, 5, 6] },
                ]
            }
        },
    ]
};
