import * as vscode from 'vscode';
import { TagValidationContext, TagValidationRuleFn } from '../types'; // Adjust import path
import { createTagDiagnostic, findTagAttributeNameRange } from '../helpers'; // Adjust import path

/**
 * Validates that all attribute names used in an opening tag instance
 * correspond to attributes defined in the TagDefinition.
 * Explicitly ignores the special 'argv1' key used for positional arguments by the parser.
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

    // Iterate through the attributes found in the tag instance by the parser
    for (const parsedAttrName in tagInstance.attributes) {

        // Skip the special key used for the positional argument value
        if (parsedAttrName === positionalArgKey) {
            continue;
        }

        // Check if the parsed attribute name exists in the definition (case-insensitive)
        // The parser already stores keys in lowercase.
        if (!knownAttributeNamesLower.has(parsedAttrName)) {
            // This attribute name is not defined for the tag!

            // Find the range of the unknown attribute name in the original tag text
            // Try to find the original casing used in the text for a better message/highlighting
            let originalCasingAttrName = parsedAttrName; // Default to lowercase if exact match fails
            try {
                 // Attempt to find the key with original casing - case-insensitive search
                 // This regex finds the key name boundary followed by potential = or end %}/whitespace
                const searchRegex = new RegExp(`\\b(${parsedAttrName})\\b(?=\\s*=|\\s*[%}])`, 'i');
                const textMatch = tagInstance.tagText.match(searchRegex);
                if (textMatch && textMatch[1]) {
                    originalCasingAttrName = textMatch[1]; // Get the actual casing from the text
                }
            } catch (e) {
                 console.error(`[Tag Diagnostics]: Regex error finding original attribute casing for ${parsedAttrName}`, e);
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
