import * as vscode from 'vscode'; // Import vscode for DiagnosticSeverity

import { TagNames } from "../../../../../constants";
import { createTagDiagnostic } from '../../../../../logic/diagnostics/tags/helpers';
import { TagValidationRuleFn } from '../../../../../logic/diagnostics/tags/types';
// --- Define the Tag-Specific Validation Rule ---

export const validateCardIconImageConflict: TagValidationRuleFn = (context) => {
    const { tagDefinition, tagInstance } = context;
    const diagnostics: vscode.Diagnostic[] = [];

    // Check only applies to the 'card' tag's opening instance
    if (tagDefinition.tagName === TagNames.CARD && tagInstance.isOpeningTag) {
        // Case-insensitive check for attribute existence using parsed attributes
        const hasImage = Object.keys(tagInstance.attributes).some(attr => attr.toLowerCase() === 'image');
        const hasIcon = Object.keys(tagInstance.attributes).some(attr => attr.toLowerCase() === 'icon');

        if (hasImage && hasIcon) {
             // Try to highlight the whole tag; refining range might be complex here
             diagnostics.push(createTagDiagnostic(
                tagInstance.tagRange,
                `Card tag should define either 'icon' or 'image', not both.`,
                vscode.DiagnosticSeverity.Warning, // Conflict is a Warning
                `TAG-CARD-CONFLICT` // Unique code for this diagnostic
            ));
        }
    }
    return diagnostics;
};