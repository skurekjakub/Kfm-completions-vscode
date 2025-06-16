import { AttributeDataType } from "../../common/types";
import { frontmatterObjectDefinition } from "../frontmatter/frontmatterDefinition";
import { urlConfigObjectDefinition } from "../urlConfig/urlConfigDefinition";
import { subpageObjectDefinition } from "../subpage/subpageDefinition";
import { YamlObjectDefinition } from "../types";
import { getPageIdentifierCompletions } from "./getPageIdentifierCompletions";
import { getYamlHeadingCompletions } from "../getHeadingCompletions";

/**
 * Definition for the 'page' object within the main 'sequence' list.
 * Represents a single page or section within the learning module.
 */
export const pageObjectDefinition: YamlObjectDefinition = {
  id: 'module:page',
  attributes: [
    // Option 1: Reference via filename (module-local file)
    { name: 'filename', required: false, description: "Reference a module-local Markdown file (use instead of 'identifier'/'collection'). Path relative to module YAML.", dataType: AttributeDataType.String /*, loadSupportedValues: getFilenameCompletions */ }, // Suggest .md files in current/sub dirs?
    // Option 2: Reference via identifier/collection (existing workspace page)
    {
      name: 'identifier',
      required: false,
      description: "Identifier of an existing page in the workspace (use with 'collection').",
      dataType: AttributeDataType.String,
      loadSupportedValues: getPageIdentifierCompletions
    }, // Suggest existing page IDs
    {
      name: 'collection',
      required: false,
      description: "Collection ID of the existing page (use with 'identifier').",
      dataType: AttributeDataType.String
    },
    // Common attributes
    {
      name: 'exclude',
      required: false,
      description: 'Heading(s) to exclude from the referenced page content (can be a string or a list).',
      dataType: AttributeDataType.StringArray,
      loadSupportedValues: getYamlHeadingCompletions
    },
    {
      name: 'frontmatter',
      required: false,
      description: 'Frontmatter overrides for the referenced page.',
      dataType: AttributeDataType.Object,
      objectDefinition: frontmatterObjectDefinition
    },
    {
      name: 'url_config',
      required: false,
      description: 'Custom URL configuration for the page.',
      dataType: AttributeDataType.Object,
      objectDefinition: urlConfigObjectDefinition
    },
    {
      name: 'subpages',
      required: false,
      description: 'Defines subpages extracted from the referenced page content.',
      dataType: AttributeDataType.Object, // Data type of the 'subpages' key itself is Object (containing a list)
      // Defines the structure of items *within* the list value associated with the 'subpages' key
      listItemObjectDefinition: subpageObjectDefinition
    },
  ]
};
