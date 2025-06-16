import * as vscode from 'vscode';
import { TagValidationContext, TagValidationRuleFn } from '../types'; // Adjust import path
import { createTagDiagnostic } from '../helpers'; // Adjust import path
// Import TagNames if needed for type casting, though parentTagName is usually string from context
import { TagNames } from '../../../../constants';

/**
 * Validates if the tag instance is allowed within its immediate parent tag,
 * based on the tag's 'allowedParents' definition.
 */
export const validateAllowedParent: TagValidationRuleFn = (context) => {
    const { tagDefinition, tagInstance, parentTagName } = context;
    const diagnostics: vscode.Diagnostic[] = [];

    // Check only if allowedParents is defined and non-empty in the tag's definition
    if (tagDefinition.allowedParents && tagDefinition.allowedParents.length > 0) {
        // Check if the actual parent (if any) is in the allowed list
        // The parentTagName from context should be a TagNames enum value string if found.
        // The allowedParents array in the definition should also contain TagNames enum value strings.
        if (!parentTagName || !tagDefinition.allowedParents.includes(parentTagName as TagNames)) {
             const allowedList = tagDefinition.allowedParents.map(p => `'{% ${p} %}'`).join(', '); // Format list for message
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
