/**
 * Defines the allowed data types for Header and Tag attributes.
 */
export enum AttributeDataType {
  String = 'string',
  Number = 'number',
  Boolean = 'boolean',
  StringArray = 'string[]',
  Object = 'object'
}

/**
 * Base interface defining common properties for attributes used in both
 * YAML Headers and Kentico Tags.
 */
export interface BaseAttribute {
  /**
   * The name of the attribute (e.g., 'title', 'persona', 'image', 'lang').
   */
  name: string;

  /**
   * Whether the attribute is required for its context (header or tag).
   */
  required: boolean;

  /**
   * A description of the attribute, used for documentation (e.g., hovers).
   */
  description?: string;

  /**
   * The expected data type of the attribute's value.
   * Used primarily for diagnostics and potentially guiding completions.
   */
  dataType?: AttributeDataType

  /**
   * An optional static list of predefined valid values for attribute completion.
   */
  values?: (string | number | boolean)[];
}
