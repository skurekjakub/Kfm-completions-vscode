import { AttributeDataType } from '../common/types';
import { pageObjectDefinition } from './page/pageDefinition';
import {
    YamlRootDefinition
} from './types';

/**
 * Defines the root structure for the module YAML configuration file.
 */
export const moduleRootDefinition: YamlRootDefinition = {
    id: 'module:root',
    attributes: [
        {
            name: 'module_title',
            required: true,
            description: 'The display title of the learning module.',
            dataType: AttributeDataType.String
        },
        {
            name: 'module_description',
            required: true,
            description: 'A short description of the learning module.',
            dataType: AttributeDataType.String
        },
        {
            name: 'persona',
            required: true,
            description: 'The target persona for this module.',
            dataType: AttributeDataType.String,
            values: ['developer', 'business', 'architect', 'admin', 'all']
        },
        {
            name: 'sequence',
            required: true,
            description: 'An ordered list of pages included in the module.',
            dataType: AttributeDataType.Object,
            listItemObjectDefinition: pageObjectDefinition
        }
    ]
};
