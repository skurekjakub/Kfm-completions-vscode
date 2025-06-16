import * as vscode from 'vscode';
import { TagValidationContext, TagValidationRuleFn } from '../types'; // Adjust import path
import { createTagDiagnostic } from '../helpers'; // Adjust import path

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