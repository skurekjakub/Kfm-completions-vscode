import * as vscode from 'vscode';

import { MARKDOWN } from '../../../constants';
import { markdownHeaderDefinition } from '../../../definitions/header/headerDefinition';

import { getHeaderBlockRange, parseHeaderContent } from '../../completions/helpers/headerUtils';
import { HeaderValidationContext } from './types';

import { allHeaderValidationRules } from './generalRulesRegister';
import { validateRequiredAttribute } from './headerValidationRules';

// Single collection for all header-related diagnostics
export const headerDiagnosticsCollection = vscode.languages.createDiagnosticCollection("headerLinter");

/**
 * Performs comprehensive validation of the document's front matter by running registered rule functions.
 * @param editor The active text editor.
 */
export function updateHeaderDiagnostics(editor: vscode.TextEditor): void {
  const document = editor.document;
  if (document.languageId !== MARKDOWN) {
    headerDiagnosticsCollection.delete(document.uri); return;
  }

  const allDiagnostics: vscode.Diagnostic[] = [];
  const headerRange = getHeaderBlockRange(document);

  if (!headerRange) {
    headerDiagnosticsCollection.delete(document.uri); return;
  }

  const parsedHeader = parseHeaderContent(document, headerRange);
  const existingKeys = new Set(Object.keys(parsedHeader || {}));

  // Loop through defined attributes
  markdownHeaderDefinition.attributes.forEach(attrDef => {
    const attributeExists = existingKeys.has(attrDef.name);
    const attributeValue = parsedHeader?.[attrDef.name];

    // Create context for the current attribute
    const validationContext: HeaderValidationContext = {
      document,
      headerRange,
      attrDef,
      attributeExists,
      attributeValue,
      parsedHeader
    };

    // --- Run all registered validation rules for this attribute ---
    for (const rule of allHeaderValidationRules) {
      const ruleDiagnostics = rule(validationContext);
      allDiagnostics.push(...ruleDiagnostics);

      // Optional: If a rule found an error (like missing required), maybe skip subsequent rules for this attribute?
      if (attrDef.required && !attributeExists && rule === validateRequiredAttribute && ruleDiagnostics.length > 0) {
        break; // Stop checking this attribute if required one is missing
      }

      // --- Run EXPLICIT Custom Rules (if defined) ---
      // Run these even if attribute is missing, as a custom rule might specifically check that.
      // Adjust placement if custom rules should only run if attribute exists or passes standard checks.
      if (attrDef.validationRules && Array.isArray(attrDef.validationRules)) {
        console.log(`Running ${attrDef.validationRules.length} custom rule(s) for '${attrDef.name}'...`);
        for (const customRule of attrDef.validationRules) {
            try {
                allDiagnostics.push(...customRule(validationContext));
            } catch (ruleError) {
                console.error(`Error running custom validation rule '${customRule.name}' for attribute '${attrDef.name}':`, ruleError);
            }
        }
      }
    }
  });

  // Update the collection
  headerDiagnosticsCollection.set(document.uri, allDiagnostics);
}
