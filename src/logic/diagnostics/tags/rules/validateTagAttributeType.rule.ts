import * as vscode from 'vscode';
import { TagValidationContext, TagValidationRuleFn } from '../types'; // Adjust import path
import { createTagDiagnostic, checkTagAttributeType, findTagAttributeValueRange } from '../helpers'; // Adjust import path

/**
 * Validates the data type of existing attributes based on the TagAttribute definition.
 */
export const validateTagAttributeType: TagValidationRuleFn = (context) => {
    const { tagDefinition, tagInstance, document } = context;
    const diagnostics: vscode.Diagnostic[] = [];

    // Only check attributes on opening tags
    if (!tagInstance.isOpeningTag) {
        return diagnostics;
    }

    tagDefinition.attributes.forEach(attrDef => {
        // Check type only if a dataType is defined for the attribute
        if (attrDef.dataType) {
            const lowerAttrName = attrDef.name.toLowerCase();
            // Check if the attribute exists in the parsed instance (case-insensitive keys from parser)
            if (tagInstance.attributes.hasOwnProperty(lowerAttrName)) {
                const actualValueString = tagInstance.attributes[lowerAttrName];
                // Use the helper function to check the type based on the string value
                if (!checkTagAttributeType(actualValueString, attrDef.dataType)) {
                    // Try to find the specific range of the attribute value for better highlighting
                    const valueRange = findTagAttributeValueRange(document, tagInstance.tagRange, attrDef.name) || tagInstance.tagRange; // Fallback to whole tag range

                    diagnostics.push(createTagDiagnostic(
                        valueRange,
                        `Attribute '${attrDef.name}' has incorrect type. Expected type '${attrDef.dataType}'.`,
                        vscode.DiagnosticSeverity.Warning, // Type mismatches are often Warnings
                        `TAG-TYPE-${tagDefinition.tagName.toUpperCase()}-${attrDef.name.toUpperCase()}`
                    ));
                }
            }
        }
    });

    return diagnostics;
};
