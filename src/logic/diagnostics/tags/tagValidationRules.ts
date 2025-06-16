import * as vscode from 'vscode';
import { TagValidationContext, TagValidationRuleFn } from './types';
import { createTagDiagnostic, checkTagAttributeType, findTagAttributeValueRange, findTagAttributeNameRange } from './helpers';
import { TagNames } from '../../../constants';
import { getTagDefinition } from '../../../definitions/definitionRegister';
// We might need TagUtils later for complex checks like parent validation
// import { TagUtils } from '../../completions/helpers/tagUtils';

/**
 * Validates that all required *named* attributes defined in the TagDefinition are present
 * in the opening tag instance.
 */
export const validateRequiredTagAttribute: TagValidationRuleFn = (context) => {
    const { tagDefinition, tagInstance } = context;
    const diagnostics: vscode.Diagnostic[] = [];

    // Only check opening tags for missing attributes
    if (!tagInstance.isOpeningTag) {
        return diagnostics;
    }

    const parsedAttributeNamesLower = new Set(Object.keys(tagInstance.attributes).map(k => k.toLowerCase()));

    tagDefinition.attributes.forEach(attrDef => {
        // Check only named required attributes for now
        if (attrDef.required && !attrDef.isPositional) {
            if (!parsedAttributeNamesLower.has(attrDef.name.toLowerCase())) {
                // Highlight the tag opening part (e.g., {% tagname ... %})
                // Ideally, highlight just the tag name, but tagRange is simpler for now.
                diagnostics.push(createTagDiagnostic(
                    tagInstance.tagRange,
                    `Required attribute '${attrDef.name}' is missing from tag '{% ${tagDefinition.tagName} %}'.`,
                    vscode.DiagnosticSeverity.Error, // Required attribute missing is an Error
                    `TAG-REQ-${tagDefinition.tagName.toUpperCase()}-${attrDef.name.toUpperCase()}`
                ));
            }
        }
        // TODO: Validate required POSITIONAL attributes. This requires analyzing the tag's
        //       content structure more deeply than the simple attribute parsing done so far.
        //       It might involve checking specific parts of the tagInstance.tagText.
    });

    return diagnostics;
};

/**
 * Validates the data type of existing attributes based on the TagAttribute definition.
 */
export const validateTagAttributeType: TagValidationRuleFn = (context) => {
    const { tagDefinition, tagInstance, document } = context;
    const diagnostics: vscode.Diagnostic[] = [];

    if (!tagInstance.isOpeningTag) {
        return diagnostics;
    }

    tagDefinition.attributes.forEach(attrDef => {
        // Check type only if a dataType is defined for the attribute
        if (attrDef.dataType) {
            const lowerAttrName = attrDef.name.toLowerCase();
            // Check if the attribute exists in the parsed instance
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

/**
 * Validates attribute values against a predefined list in the TagAttribute definition, if present.
 */
export const validateTagAttributeAllowedValues: TagValidationRuleFn = (context) => {
    const { tagDefinition, tagInstance, document } = context;
    const diagnostics: vscode.Diagnostic[] = [];

    if (!tagInstance.isOpeningTag) {
        return diagnostics;
    }

    tagDefinition.attributes.forEach(attrDef => {
        // Check only if a static list of values is defined and the attribute exists
        if (attrDef.values && Array.isArray(attrDef.values) && attrDef.values.length > 0) {
            const lowerAttrName = attrDef.name.toLowerCase();
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

/**
 * Validates if the tag instance is allowed within its immediate parent tag.
 */
export const validateAllowedParent: TagValidationRuleFn = (context) => {
    // This rule's logic from the placeholder seemed mostly correct. Keeping it.
    const { tagDefinition, tagInstance, parentTagName } = context;
    const diagnostics: vscode.Diagnostic[] = [];

    // Check only if allowedParents is defined and non-empty in the tag's definition
    if (tagDefinition.allowedParents && tagDefinition.allowedParents.length > 0) {
        // Check if the actual parent (if any) is in the allowed list
        if (!parentTagName || !tagDefinition.allowedParents.includes(parentTagName as TagNames)) {
            const allowedList = tagDefinition.allowedParents.map(p => `'{% ${p} %}'`).join(', '); // Format list
            const message = parentTagName
                ? `Tag '{% ${tagDefinition.tagName} %}' cannot be nested directly inside '{% ${parentTagName} %}'. Allowed parents: ${allowedList}.`
                : `Tag '{% ${tagDefinition.tagName} %}' cannot be used at the root level. Allowed parents: ${allowedList}.`;

            // Apply diagnostic to the opening tag instance only, as nesting applies to the start
            if (tagInstance.isOpeningTag) {
                diagnostics.push(createTagDiagnostic(
                    tagInstance.tagRange, // Highlight the whole tag for now
                    message,
                    vscode.DiagnosticSeverity.Error, // Parent violations are usually Errors
                    `TAG-PARENT-${tagDefinition.tagName.toUpperCase()}`
                ));
            }
        }
    }
    return diagnostics;
};

/**
 * Validates that all attribute names used in an opening tag instance
 * correspond to attributes defined in the TagDefinition.
 */
export const validateUnknownTagAttribute: TagValidationRuleFn = (context) => {
    const { tagDefinition, tagInstance, document } = context;
    const diagnostics: vscode.Diagnostic[] = [];
    const positionalArgKey = 'argv1'; // The key used by TagUtils.parseAttributes

    // Only check opening tags
    if (!tagInstance.isOpeningTag) {
        return diagnostics;
    }

    // Create a set of known attribute names (lowercase) for efficient lookup
    const knownAttributeNamesLower = new Set(
        tagDefinition.attributes.map(attr => attr.name.toLowerCase())
    );

    // Iterate through the attributes found in the tag instance
    for (const parsedAttrName in tagInstance.attributes) {
        // Skip the special key used for the positional argument value
        if (parsedAttrName === positionalArgKey) {
            continue;
        }

        // The parser stores keys in lowercase, so we check directly
        if (!knownAttributeNamesLower.has(parsedAttrName)) {
            // This attribute name is not defined for the tag!

            // Find the range of the unknown attribute name in the original tag text
            // Note: The parsedAttrName is lowercase, but we need the original casing
            //       from the tag text to find its range accurately.
            //       Let's find the original key from the tag text based on the lowercase key.
            //       This requires searching the tagText for the key occurrence.
            //       (Using findTagAttributeNameRange helper added previously)

            // We need the *original casing* key as it appeared in the tag text
            // We can iterate through the text to find the key associated with the parsed lowercase key.
            // This is a bit complex; let's try finding the first key that matches lowercase.
            let originalCasingAttrName = parsedAttrName; // Default, might be incorrect casing
            const searchRegex = new RegExp(`\\b(${parsedAttrName})\\b`, 'i'); // Find the key case-insensitively
            const textMatch = tagInstance.tagText.match(searchRegex);
            if (textMatch && textMatch[1]) {
                originalCasingAttrName = textMatch[1]; // Get the actual casing from the text
            }


            const nameRange = findTagAttributeNameRange(document, tagInstance.tagRange, originalCasingAttrName);

            diagnostics.push(createTagDiagnostic(
                nameRange || tagInstance.tagRange, // Highlight specific name, fallback to whole tag
                `Unknown attribute '${originalCasingAttrName}' found for tag '{% ${tagDefinition.tagName} %}'.`,
                vscode.DiagnosticSeverity.Warning, // Unknown attribute is a Warning
                `TAG-UNKNOWN-${tagDefinition.tagName.toUpperCase()}-${originalCasingAttrName.toUpperCase()}`
            ));
        }
    }

    return diagnostics;
};

// Placeholder Rule: Check for mismatched end tags
// Requires document-level analysis or different context passing.
export const validateMismatchedEndTag: TagValidationRuleFn = (context) => {
    // TODO: Implement this rule. It likely runs once per document or needs stack info passed differently.
    return [];
};

// Placeholder Rule: Check for unclosed tags
// Requires document-level analysis (final stack state).
export const validateUnclosedTag: TagValidationRuleFn = (context) => {
    // TODO: Implement this rule. It likely runs once per document.
    return [];
};
