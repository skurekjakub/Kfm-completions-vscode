import { AttributeDataType } from "../../common/types";
import { frontmatterObjectDefinition } from "../frontmatter/frontmatterDefinition";
import { getYamlHeadingCompletions } from "../getHeadingCompletions";
import { YamlObjectDefinition } from "../types";

/**
 * Definition for objects appearing within the 'subpages' list.
 * Defines how to extract a portion of a referenced page.
 */
export const subpageObjectDefinition: YamlObjectDefinition = {
  id: 'module:subpage',
  attributes: [
    {
      name: 'start',
      required: true,
      description: 'Heading text (or "start") marking the beginning of the subpage content.',
      dataType: AttributeDataType.String /*, loadSupportedValues: getHeadingCompletions */,
      loadSupportedValues: getYamlHeadingCompletions
    }, // Suggest headings from parent page
    {
      name: 'end',
      required: true,
      description: 'Heading text (or "end") marking the end of the subpage content.',
      dataType: AttributeDataType.String /*, loadSupportedValues: getHeadingCompletions */,
      loadSupportedValues: getYamlHeadingCompletions
    }, // Suggest headings from parent page
    {
      name: 'slug',
      required: true,
      description: 'URL slug for this subpage.',
      dataType: AttributeDataType.String
    },
    {
      name: 'exclude',
      required: false,
      description: 'Heading(s) to exclude from this subpage content (can be a string or a list).',
      dataType: AttributeDataType.StringArray /*, loadSupportedValues: getHeadingCompletions */,
      loadSupportedValues: getYamlHeadingCompletions
    }, // StringArray allows single string or list
    {
      name: 'frontmatter',
      required: false, description: 'Frontmatter overrides specific to this subpage.',
      dataType: AttributeDataType.Object,
      objectDefinition: frontmatterObjectDefinition
    }, // Reuse frontmatter definition
  ]
};
