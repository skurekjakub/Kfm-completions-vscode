import * as vscode from 'vscode';
import { HeaderAttribute } from '../../../definitions/header/types';

/**
 * Context passed to each validation rule function.
 */
export interface HeaderValidationContext {
    document: vscode.TextDocument;
    headerRange: vscode.Range;
    attrDef: HeaderAttribute;
    attributeExists: boolean;
    attributeValue: any;
    parsedHeader: Record<string, any> | undefined; // Entire parsed header for context if needed
}

/**
 * Signature for a header validation rule function.
 * Should return an array of diagnostics (empty if no issues found).
 */
export type HeaderValidationRuleFn = (context: HeaderValidationContext) => vscode.Diagnostic[];
