import * as vscode from 'vscode';
import { TagValidationContext, TagValidationRuleFn } from '../types'; // Adjust import path
import { createTagDiagnostic, findTagAttributeValueRange } from '../helpers'; // Adjust import path

/**
 * Validates attribute values against a predefined list in the TagAttribute definition, if present.
 */
export const validateTagAttributeAllowedValues: TagValidationRuleFn = (context) => {
    const { tagDefinition, tagInstance, document } = context;
    const diagnostics: vscode.Diagnostic[] = [];

    // Only check attributes on opening tags
    if (!tagInstance.isOpeningTag) {
        return diagnostics;
    }

     tagDefinition.attributes.forEach(attrDef => {
         // Check only if a static list of values is defined and the attribute exists
         if (attrDef.values && Array.isArray(attrDef.values) && attrDef.values.length > 0) {
             const lowerAttrName = attrDef.name.toLowerCase();
             // Check if the attribute exists in the parsed instance (case-insensitive keys from parser)
             if (tagInstance.attributes.hasOwnProperty(lowerAttrName)) {
                 const actualValue = tagInstance.attributes[lowerAttrName];
                 // Convert allowed values to strings for comparison as parsed attributes are strings
                 const allowedValuesSet = new Set(attrDef.values.map(String));

                 // Check if the actual value is in the allowed set
                 if (!allowedValuesSet.has(actualValue)) {
                      // Try to find the specific range of the attribute value
                      const valueRange = findTagAttributeValueRange(document, tagInstance.tagRange, attrDef.name) || tagInstance.tagRange; // Fallback
                      const allowedList = attrDef.values.map(v => `'${v}'`).join(', '); // Format for message

                      diagnostics.push(createTagDiagnostic(
                          valueRange,
                          `Invalid value '${actualValue}' for attribute '${attrDef.name}'. Allowed values are: ${allowedList}.`,
                          vscode.DiagnosticSeverity.Warning, // Using a wrong value is typically a Warning
                          `TAG-VAL-${tagDefinition.tagName.toUpperCase()}-${attrDef.name.toUpperCase()}`
                      ));
                 }
             }
         }
     });

    return diagnostics;
};
