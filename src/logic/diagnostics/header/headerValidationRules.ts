// src/logic/diagnostics/headerDiagnosticsHandler.ts

import * as vscode from 'vscode';
import { checkType, createDiagnostic, findAttributeLine, findAttributeValueRange } from './helpers';
import { HeaderValidationContext, HeaderValidationRuleFn } from './types';
import { AttributeDataType } from '../../../definitions/common/types';

// The const name: Type = ... syntax was used specifically for the validation
//  rules to clearly enforce their adherence to the shared HeaderValidationRuleFn type. 
// The standard function name(...) syntax was used for the general utility helpers within the 
// file where that explicit interface enforcement wasn't the primary goal. Both are valid and 
// largely a matter of stylistic choice or specific technical needs (like explicit type conformance 
// or this binding with arrow functions).
// --- validateRequiredAttribute ---
export const validateRequiredAttribute: HeaderValidationRuleFn = (context: HeaderValidationContext) => {
  const { attrDef, attributeExists, headerRange, document, parsedHeader } = context;
  const diagnostics: vscode.Diagnostic[] = [];

  // Standard check: Is the attribute defined as required?
  if (attrDef.required) {
      // Conditional logic specifically for 'persona'
      if (attrDef.name === 'persona') {
          // Check if 'searchable: false' exists in the parsed header
          const isSearchableFalse = parsedHeader?.['searchable'] === false;

          // Require 'persona' ONLY if it's missing AND searchable is NOT explicitly false
          if (!attributeExists && !isSearchableFalse) {
              const diagnosticRange = document.lineAt(headerRange.start.line).rangeIncludingLineBreak;
              diagnostics.push(createDiagnostic(
                  diagnosticRange,
                  `Required header attribute 'persona' is missing (and page is searchable or searchable is undefined).`,
                  vscode.DiagnosticSeverity.Error,
                  `HEADER-REQ-${attrDef.name.toUpperCase()}`
              ));
          }
      }
      // Original logic for all other required attributes
      else if (!attributeExists) {
          const diagnosticRange = document.lineAt(headerRange.start.line).rangeIncludingLineBreak;
          diagnostics.push(createDiagnostic(
              diagnosticRange,
              `Required header attribute '${attrDef.name}' is missing.`,
              vscode.DiagnosticSeverity.Error,
              `HEADER-REQ-${attrDef.name.toUpperCase()}`
          ));
      }
  }
  return diagnostics;
};

export const validateAttributeType: HeaderValidationRuleFn = (context) => {
  const { attrDef, attributeExists, attributeValue, document, headerRange } = context;
  const diagnostics: vscode.Diagnostic[] = [];

  if (attributeExists && attrDef.dataType && attributeValue !== null && attributeValue !== undefined) {
    if (!checkType(attributeValue, attrDef.dataType)) {
      const fallbackLine = findAttributeLine(document, headerRange, attrDef.name);
      const fallbackRange = fallbackLine?.range ?? document.lineAt(headerRange.start.line).range;
      const valueRange = findAttributeValueRange(document, headerRange, attrDef.name) ?? fallbackRange;

      let foundTypeMessage;
      if (Array.isArray(attributeValue) && attrDef.dataType === AttributeDataType.StringArray) {
        foundTypeMessage = "array with non-string items";
      } else if (Array.isArray(attributeValue) && attrDef.dataType === 'object') {
        foundTypeMessage = "array";
      }
      diagnostics.push(createDiagnostic(
        valueRange,
        `Attribute '${attrDef.name}' has incorrect type. Expected '${attrDef.dataType}', found '${foundTypeMessage}'.`,
        vscode.DiagnosticSeverity.Warning,
        `HEADER-TYPE-${attrDef.name.toUpperCase()}`
      ));
    }
  }
  return diagnostics;
};

export const validateAttributeAllowedValues: HeaderValidationRuleFn = (context) => {
  const { attrDef, attributeExists, attributeValue, document, headerRange } = context;
  const diagnostics: vscode.Diagnostic[] = [];

  if (attributeExists && attrDef.values && Array.isArray(attrDef.values) && attrDef.values.length > 0 && attributeValue !== null && attributeValue !== undefined) {
    const allowedValuesSet = new Set(attrDef.values.map(String));
    let isInvalid = false;
    let invalidDetail = "";

    if (attrDef.dataType === 'string' && typeof attributeValue === 'string') {
      const actualValues = attributeValue.split(',').map(s => s.trim()).filter(s => s !== '');
      const firstInvalidValue = actualValues.find(v => !allowedValuesSet.has(v));
      if (firstInvalidValue !== undefined) { isInvalid = true; invalidDetail = ` Invalid item found: '${firstInvalidValue}'.`; }
      else if (actualValues.length === 0 && attributeValue.trim() !== '') { isInvalid = true; invalidDetail = ` Value contains only delimiters or whitespace.`; }
    } else {
      const actualValueStr = String(attributeValue);
      if (!allowedValuesSet.has(actualValueStr)) { isInvalid = true; }
    }

    if (isInvalid) {
      const fallbackLine = findAttributeLine(document, headerRange, attrDef.name);
      const fallbackRange = fallbackLine?.range ?? document.lineAt(headerRange.start.line).range;
      const valueRange = findAttributeValueRange(document, headerRange, attrDef.name) ?? fallbackRange;
      diagnostics.push(createDiagnostic(
        valueRange,
        `Invalid value for '${attrDef.name}'.${invalidDetail} Allowed values are: ${[...allowedValuesSet].join(', ')}.`,
        vscode.DiagnosticSeverity.Warning,
        `HEADER-VAL-${attrDef.name.toUpperCase()}`
      ));
    }
  }
  return diagnostics;
};

export const validateNestedAttributes: HeaderValidationRuleFn = (context) => {
  const { attrDef, attributeExists, attributeValue, document, headerRange } = context;
  const diagnostics: vscode.Diagnostic[] = [];

  // Use the corrected plain object check
  if (attributeExists &&
    attrDef.dataType === 'object' &&
    attrDef.attributes &&
    typeof attributeValue === 'object' &&
    !Array.isArray(attributeValue) &&
    attributeValue !== null
  ) {
    const nestedObject = attributeValue as Record<string, any>;
    const parentLine = findAttributeLine(document, headerRange, attrDef.name)?.lineNumber ?? headerRange.start.line;

    attrDef.attributes.forEach(nestedAttrDef => {
      // Check required nested
      if (nestedAttrDef.required && !(nestedAttrDef.name in nestedObject)) {
        const diagnosticRange = document.lineAt(parentLine).range;
        diagnostics.push(createDiagnostic(
          diagnosticRange,
          `Required nested attribute '${nestedAttrDef.name}' is missing under '${attrDef.name}'.`,
          vscode.DiagnosticSeverity.Error,
          `HEADER-REQ-${attrDef.name.toUpperCase()}-${nestedAttrDef.name.toUpperCase()}`
        ));
      }
    });
  }
  // Note: This doesn't currently handle the warning if type is 'object' but value isn't a plain object.
  // That logic could be added here or kept separate if preferred.

  return diagnostics;
};
