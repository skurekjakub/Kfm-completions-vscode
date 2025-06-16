import * as vscode from 'vscode';

// --- Base Context (Common Properties) ---
export interface BaseHeaderContext {
    /** Range of the entire ---...--- block, if applicable */
    headerRange?: vscode.Range;
    /** Text of the line the cursor is on */
    currentLineText?: string;
    /** Indentation level of the current line */
    currentIndentation?: number;
    /** Character position on the current line */
    cursorPositionInLine?: number;
    /** Attempt to parse the entire YAML header */
    parsedHeader?: Record<string, any>;
}

// --- Specific Context States ---

/** Context when the cursor is NOT inside the header block */
export interface NotInHeaderContext extends BaseHeaderContext {
    contextType: 'NotInHeader';
    isInHeader: false;
}

/** Context when cursor is inside header, potentially ready for a new attribute key */
export interface InHeaderAttributeKeyContext extends BaseHeaderContext {
    contextType: 'AttributeKey';
    isInHeader: true;
    // No specific attribute/value info yet, just general position
}

/** Context when cursor is positioned for a simple key: value */
export interface InHeaderAttributeValueContext extends BaseHeaderContext {
    contextType: 'AttributeValue';
    isInHeader: true;
    /** The name of the attribute whose value is expected */
    attributeName: string;
     /** The definition of the attribute (optional but useful) */
    attributeDefinition?: HeaderAttribute; // Assuming HeaderAttribute is defined elsewhere
    /** Potential range of the value being typed */
    valueRange?: vscode.Range;
}

/** Context when cursor is positioned for a YAML list item value ('- value') */
export interface InHeaderListItemValueContext extends BaseHeaderContext {
    contextType: 'ListItemValue';
    isInHeader: true;
    /** The name of the list attribute this item belongs to */
    parentAttributeName: string;
     /** The definition of the parent list attribute (optional but useful) */
    parentAttributeDefinition?: HeaderAttribute; // Assuming HeaderAttribute is defined elsewhere
}

/** Context when cursor is indented under an object attribute, ready for a nested key */
export interface InHeaderNestedAttributeKeyContext extends BaseHeaderContext {
  contextType: 'NestedAttributeKey';
  isInHeader: true;
  /** The name of the parent object attribute (e.g., 'toc') */
  parentAttributeName: string;
  /** The definition of the parent object attribute */
  parentAttributeDefinition: HeaderAttribute; // Include the parent definition
  /** Indentation level expected for the nested key */
  expectedIndent: number;
}

/** Context when cursor is positioned for the value of a NESTED attribute (e.g., toc -> minHeadingLevel: |) */
export interface InHeaderNestedAttributeValueContext extends BaseHeaderContext {
    contextType: 'NestedAttributeValue';
    isInHeader: true;
    parsedHeader: Record<string, any>; // Required
    /** The name of the parent object attribute (e.g., 'toc') */
    parentAttributeName: string;
    /** The definition of the parent object attribute */
    parentAttributeDefinition: HeaderAttribute; // Required
    /** The name of the nested attribute whose value is expected (e.g., 'minHeadingLevel') */
    nestedAttributeName: string;
     /** The definition of the nested attribute */
    nestedAttributeDefinition: HeaderAttribute; // Required
}

// --- The Union Type ---
export type HeaderContext =
    | NotInHeaderContext
    | InHeaderAttributeKeyContext
    | InHeaderAttributeValueContext
    | InHeaderListItemValueContext
    | InHeaderNestedAttributeKeyContext
    | InHeaderNestedAttributeValueContext;

// --- You might also need the HeaderAttribute definition if not already imported ---
// Assuming it's still in definitions/header/types.ts
import { HeaderAttribute } from '../../../definitions/header/types';