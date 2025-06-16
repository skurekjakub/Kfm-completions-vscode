import { AttributeDataType } from "../../common/types";
import { YamlObjectDefinition } from "../types";

/**
 * Definition for the 'url_config' object within a 'page' item.
 * Allows customizing URL generation for a specific page entry.
 */
export const urlConfigObjectDefinition: YamlObjectDefinition = {
    id: 'module:url_config',
    attributes: [
        { name: 'slug', required: false, description: 'Custom page slug for this specific entry in the module.', dataType: AttributeDataType.String },
        { name: 'canonical', required: false, description: "Overrides the page's canonical URL (useful when reusing content).", dataType: AttributeDataType.String /*, loadSupportedValues: getPageIdentifierCompletions */ }, // Suggest existing page IDs?
        { name: 'collection', required: false, description: "Overrides the page's collection context.", dataType: AttributeDataType.String /*, loadSupportedValues: getCollectionCompletions */ },
    ]
};
