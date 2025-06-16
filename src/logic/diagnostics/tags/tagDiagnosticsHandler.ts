import * as vscode from 'vscode';
import { MARKDOWN } from '../../../constants';
import { TagInstanceInfo, TagValidationContext } from './types';
import { allTagDocumentValidationRules, allTagValidationRules } from './rulesRegister';
import { scanDocumentForTags } from '../../_helpers/tagScanner';

// Single collection for all tag-related diagnostics
export const tagDiagnosticsCollection = vscode.languages.createDiagnosticCollection("tagLinter");

export async function updateTagDiagnostics(editor: vscode.TextEditor): Promise<void> {
    const document = editor.document;
    if (document.languageId !== MARKDOWN) {
        tagDiagnosticsCollection.delete(document.uri);
        return;
    }

    const allDiagnostics: vscode.Diagnostic[] = [];
    const { allTagsInfo, uniqueTagDefinitions } = await scanDocumentForTags(document); // List to store info about ALL tags found

    // --- Pass 2: Run Per-Instance Validation Rules ---
    const instanceRuleStack: TagInstanceInfo[] = []; // Stack used for per-instance parent context
    const mismatchedClosingTags: TagInstanceInfo[] = []; // <-- Initialize list for mismatches

    for (const currentTagInfo of allTagsInfo) {
        const definition = uniqueTagDefinitions.get(currentTagInfo.tagName); // Get stored definition
        if (!definition) {continue;}

        let matchedOpeningTagContext: TagInstanceInfo | undefined = undefined;
        const currentParentInfo = instanceRuleStack.length > 0 ? instanceRuleStack[instanceRuleStack.length - 1] : undefined;

        // Match closing tags and collect mismatches
        if (definition.isPairTag) {
            if (currentTagInfo.isOpeningTag) {
                instanceRuleStack.push(currentTagInfo);
            } else if (currentTagInfo.isClosingTag) {
                if (currentParentInfo?.tagName === currentTagInfo.tagName) {
                    // Correct closing tag found
                    matchedOpeningTagContext = instanceRuleStack.pop(); // Pop and store for context
                } else {
                    // Mismatched closing tag! Add it to the list for Pass 3 processing.
                    mismatchedClosingTags.push(currentTagInfo);
                }
            }
        }

        const validationContext: TagValidationContext = {
            document,
            editor,
            tagDefinition: definition,
            tagInstance: currentTagInfo,
            parentTagName: currentParentInfo?.tagName,
            matchingOpeningTag: matchedOpeningTagContext
        };

        // Run globally registered per-instance rules
        if (typeof allTagValidationRules !== 'undefined' && Array.isArray(allTagValidationRules)) {
            for (const rule of allTagValidationRules) {
                if (typeof rule === 'function') {
                    try { allDiagnostics.push(...rule(validationContext)); } catch (e) { console.error(`[Tag Diagnostics]: Global instance rule error: ${e}`); }
                }
            }
        }
        // Run definition-specific per-instance rules
        if (definition.validationRules && Array.isArray(definition.validationRules)) {
            for (const specificRule of definition.validationRules) {
                if (typeof specificRule === 'function') {
                    try { allDiagnostics.push(...specificRule(validationContext)); } catch (e) { console.error(`[Tag Diagnostics]: Specific instance rule error: ${e}`); }
                }
            }
        }
    }
    // Store the final stack state after processing all tags for document-level rules
    const finalTagStackState = [...instanceRuleStack];
    console.log(`[Tag Diagnostics]: Pass 2 complete. Per-instance rules applied. Final stack size: ${finalTagStackState.length}`);


    // --- Pass 3: Run Document-Level Validation Rules ---
    console.log(`[Tag Diagnostics]: Starting Pass 3 (Document-Level Rules)...`);

    // Run Globally Registered Document-Level Rules
    if (typeof allTagDocumentValidationRules !== 'undefined' && Array.isArray(allTagDocumentValidationRules)) {
        for (const docRule of allTagDocumentValidationRules) {
            if (typeof docRule === 'function') {
                try {
                    // Pass document, all tags info, and final stack state
                    allDiagnostics.push(...docRule(document, allTagsInfo, finalTagStackState, mismatchedClosingTags));
                } catch (e) {
                    console.error(`[Tag Diagnostics]: Global document rule error for ${docRule.name || 'anonymous'}: ${e}`);
                }
            }
        }
    }

    // Run Definition-Specific Document-Level Rules
    // Iterate through the unique definitions we found in Pass 1
    for (const definition of uniqueTagDefinitions.values()) {
        if (definition.documentValidationRules && Array.isArray(definition.documentValidationRules)) {
            // console.log(`  -> Running ${definition.documentValidationRules.length} specific document rules for ${definition.tagName}`);
            for (const specificDocRule of definition.documentValidationRules) {
                if (typeof specificDocRule === 'function') {
                    try {
                        // Pass document, all tags info, and final stack state
                        allDiagnostics.push(...specificDocRule(document, allTagsInfo, finalTagStackState, mismatchedClosingTags));
                    } catch (e) {
                        console.error(`[Tag Diagnostics]: Specific document rule error for ${definition.tagName} (${specificDocRule.name || 'anonymous'}): ${e}`);
                    }
                }
            }
        }
    }
    console.log(`[Tag Diagnostics]: Pass 3 complete.`);

    console.log(`[Tag Diagnostics]: Update Complete. Found ${allDiagnostics.length} total issues.`);
    tagDiagnosticsCollection.set(document.uri, allDiagnostics);
}