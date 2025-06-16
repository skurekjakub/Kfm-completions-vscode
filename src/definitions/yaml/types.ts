import * as vscode from 'vscode';
import { BaseAttribute, AttributeDataType } from '../common/types'; // Reuse BaseAttribute and standard types

// Forward declarations for nested structures
export interface YamlObjectDefinition {};
export interface YamlListDefinition {};

/**
 * Defines the signature for functions that can dynamically provide
 * completion items for the *value* of a specific YAML attribute (key).
 * The context needs to be carefully determined by the provider using a YAML parser.
 *
 * @async
 * @param {vscode.TextDocument} document - The text document being edited.
 * @param {vscode.Position} position - The current cursor position where completion is requested.
 * @param {string[]} nodePath - The path of keys/indices leading to the current node (e.g., ['sequence', 0, 'collection']).
 * @param {any} parentNode - The parent node object/array from the parsed YAML structure.
 * @returns {Promise<vscode.CompletionItem[] | undefined>} A Promise resolving to an array of completion items or undefined.
 */
export type YamlAttributeValueProviderFn = (
    document: vscode.TextDocument,
    position: vscode.Position,
    nodePath: (string | number)[], // Path can include list indices
    parentNode: any // Parsed parent node from YAML library (e.g., yaml module)
    // Consider adding the current key if completing a value: currentKey?: string
) => Promise<vscode.CompletionItem[] | undefined>;


/**
 * Defines a specific attribute (key-value pair) expected within a YAML object.
 * Extends BaseAttribute.
 */
export interface YamlAttributeDefinition extends BaseAttribute {
    /** The expected data type of the attribute's value. Uses standard AttributeDataType. */
    dataType?: AttributeDataType; // Reuse standard types like String, Number, Boolean, Object, StringArray

    /** If dataType is 'Object', this defines the structure of the nested object. */
    objectDefinition?: YamlObjectDefinition;

    /** If dataType is 'StringArray', this defines list-like properties (though YAML handles list syntax). */
    // listDefinition?: YamlListDefinition; // Maybe not needed if StringArray implies simple list

    /** If the value itself is a list of complex objects (not just strings). */
    listItemObjectDefinition?: YamlObjectDefinition;

    /** Delegate function to load supported values dynamically for this attribute's value. */
    loadSupportedValues?: YamlAttributeValueProviderFn;

    /** Default value snippet (optional) */
    defaultValue?: string;
}

/**
 * Defines the structure of a YAML object, listing its expected attributes (keys).
 */
export interface YamlObjectDefinition {
    /** A unique identifier for this object structure definition (optional, for reuse). */
    id?: string;
    /** An array defining the possible attributes (keys) for this object. */
    attributes: YamlAttributeDefinition[];
    /** Allow additional, undefined attributes? Defaults to false if omitted. */
    allowUnknownKeys?: boolean; // Useful for YAML flexibility
}

/**
 * Defines the structure of items within a YAML list (sequence).
 * Used when an attribute's dataType is Object/List and it contains complex items.
 */
export interface YamlListItemDefinition {
     /** A unique identifier for this list item structure definition (optional). */
     id?: string;
    /** Defines the structure of the objects expected within the list. */
    itemObjectDefinition: YamlObjectDefinition;
}

// Define the root type - assuming the config file root is always an object.
export type YamlRootDefinition = YamlObjectDefinition;

