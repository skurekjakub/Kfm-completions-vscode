import * as vscode from 'vscode';
import { HeaderContext } from '../../logic/completions/helpers/headerContext.types';
import { BaseAttribute } from '../common/types';
import { HeaderValidationRuleFn } from '../../logic/diagnostics/header/types';

/**
 * Represents the overall structure and defined attributes for the Markdown header.
 */
export interface HeaderDefinition {
    /** A unique identifier for this definition type (e.g., 'markdownHeader'). */
    definitionType: 'markdownHeader';
    /** An array defining the possible attributes for the header. */
    attributes: HeaderAttribute[];
}

/**
 * Defines the properties and behavior of a specific Markdown header attribute.
 * Extends BaseAttribute with header-specific properties.
 */
export interface HeaderAttribute extends BaseAttribute {
    /** Function to dynamically load supported values for header attributes. */
    loadSupportedValues?: HeaderAttributeValueProvider;

    /** Hint if the value is expected to be multi-line (e.g., using `|` or `>`). */
    isMultiLine?: boolean; // Specific to header formatting? Keep if needed.

    /** Function to generate a custom completion item when suggested as missing. */
    getMissingAttributeCompletion?: MissingAttributeCompletionProviderFn;

    /** If dataType is 'object', defines nested attributes. */
    attributes?: HeaderAttribute[]; // Nested attributes are also HeaderAttributes
    /**
     * An array of validation functions to run for this header attribute.
     * If omitted, no validation specific to this definition will run (beyond basic parsing).
     */
    validationRules?: HeaderValidationRuleFn[];
}

export type MissingAttributeCompletionProviderFn = (
  document: vscode.TextDocument,
  position: vscode.Position,
  headerContext: HeaderContext, // Pass context for potential data lookup (like identifier)
  attrDef: HeaderAttribute // Pass the definition itself
) => Promise<vscode.CompletionItem | undefined>; // Returns a single CompletionItem or undefined

/**
 * Defines the signature for functions providing completion items for header attribute *values*.
 * @param document The text document being edited.
 * @param position The current cursor position.
 * * @param headerContext Contextual information about the header block and current line/indentation.
 * * @param attrDef The definition of the specific attribute whose value is being completed.
 * @param currentAttributes A record/map of attributes already present in the header.
 * @returns A Promise resolving to an array of vscode.CompletionItem suggestions, or undefined.
 */
export type HeaderAttributeValueProvider = (
    document: vscode.TextDocument,
    position: vscode.Position,
    headerContext: HeaderContext, // Needs definition
    attrDef: HeaderAttribute,
    currentAttributes: Record<string, any> // Parsed YAML might have non-string values
) => Promise<vscode.CompletionItem[] | undefined>;
