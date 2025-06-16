import { checkAllTablesForMultipleHeaders } from "./docrules/checkAllTablesForMultipleHeaders.rule";
import { checkTagPairing } from "./docrules/checkTagPairing.rule";
import { validateAllowedParent } from "./rules/validateAllowedParent.rule";
import { validateNewlineAfterListBeforeEndTag } from "./rules/validateNewlineAfterListBeforeEndTag.rule";
import { validatePairTagIndentation } from "./rules/validatePairTagIndentation.rule";
import { validateRequiredTagAttribute } from "./rules/validateRequiredTagAttribute.rule";
import { validateTagAttributeAllowedValues } from "./rules/validateTagAttributeAllowedValues.rule";
import { validateTagAttributeType } from "./rules/validateTagAttributeType.rule";
import { validateUnknownTagAttribute } from "./rules/validateUnknownTagAttribute.rule";
import { TagDocumentValidationRuleFn, TagValidationRuleFn } from "./types";

/**
* List of all rule functions to be executed by the tagDiagnosticsHandler.
* The handler will iterate through tags in the document and call each of these rules
* with the appropriate context for that tag instance.
*
* Note: Rules like mismatched/unclosed tags might need special handling or
* to be invoked differently (e.g., once per document) depending on implementation.
*/
export const allTagValidationRules: TagValidationRuleFn[] = [
  // Rules applied per tag instance:
  validateAllowedParent,          // Check if tag is allowed in its parent
  validateRequiredTagAttribute,   // Check for missing required attributes
  validateTagAttributeType,       // Check attribute value types (placeholder)
  validateTagAttributeAllowedValues, // Check attribute values against definitions (placeholder)
  validatePairTagIndentation,
  validateNewlineAfterListBeforeEndTag,
  validateUnknownTagAttribute,
];

/**
 * List of all *globally applicable document-level* rule functions.
 * These run once after all tags have been processed.
 */
export const allTagDocumentValidationRules: TagDocumentValidationRuleFn[] = [
  checkAllTablesForMultipleHeaders,
  checkTagPairing,
];
