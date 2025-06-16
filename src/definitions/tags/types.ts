import * as vscode from 'vscode';

import { BaseAttribute } from '../common/types';
import { TagNames } from '../../constants';
import { TagDocumentValidationRuleFn, TagInstanceInfo, TagValidationRuleFn } from '../../logic/diagnostics/tags/types';

// --- Type Signatures specific to Tag attributes ---
export type AttributeValueProviderFn = (
  document: vscode.TextDocument,
  position: vscode.Position,
  tagContext: TagContext, // Uses TagContext
  attrDef: TagAttribute, // Use TagAttribute here
  currentAttributes: Record<string, string> // Tag attributes are usually strings
) => Promise<vscode.CompletionItem[] | undefined>;

/**
 * Defines the signature for functions that generate a `vscode.CompletionItem`
 * used for inserting a tag as a snippet.
 *
 * @async
 * @returns {Promise<vscode.CompletionItem>} A Promise resolving to the completion item for the snippet.
 */
export type SnippetProviderFn = () => Promise<vscode.CompletionItem>;

/**
 * Defines the signature for functions that generate decoration options for a specific tag instance.
 * These functions are typically assigned to the `decorationProvider` property
 * of a {@link TagDefinition} definition.
 *
 * @param {Readonly<TagInstanceInfo>} tagInstance - Information about the specific tag instance found in the document.
 * @param {vscode.TextDocument} document - The text document being processed.
 * @returns {vscode.DecorationOptions[] | undefined} An array of decoration options to apply to this tag instance, or undefined if no decorations are needed.
 */
export type TagDecorationProviderFn = (
  tagInstance: TagInstanceInfo,
  document: vscode.TextDocument
) => vscode.DecorationOptions[] | undefined; // Returns an array of decorations for this instance

/**
 * Defines the allowed names for decoration types used in TagDecorationProviderConfig.
 * This ensures type safety when referencing decoration styles.
 * Add new valid decoration type names here.
 */
export type DecorationTypeName =
    | 'codeHighlight' // For code block line highlighting
    | 'gutterIcon'
    | 'relativeLineHint' // For the "(Ln X)" hint shown at the end of the current line in code blocks
    | 'warningBlockBorder' // For styling warning admonition blocks <-- NEW
    ;

/**
 * Configuration object linking a specific decoration provider function
 * to a named decoration type. Used within the {@link TagDefinition}'s `decorationProviders` array.
 */
export interface TagDecorationProviderConfig {
  /**
   * A unique key identifying the type or style of decoration this provider generates
   * (e.g., 'highlight', 'gutterIcon', 'warningBorder'). This key will be used by the
   * central handler to retrieve the corresponding vscode.TextEditorDecorationType
   * from the DecorationManager.
   */
  decorationTypeName: DecorationTypeName;
  /**
   * The function implementing the TagDecorationProviderFn signature, responsible for
   * generating the actual DecorationOptions for this specific type and tag instance.
   */
  provider: TagDecorationProviderFn;
}

/**
 * Defines the signature for functions that can dynamically provide
 * completion items for the *value* of a specific tag attribute.
 * These functions are typically assigned to the `loadSupportedValues` property
 * of a {@link TagAttribute} definition.
 *
 * @param document The text document being edited.
 * @param position The current cursor position where completion is requested.
 * @param tagContext Contextual information about the enclosing tag instance, provided by {@link TagUtils.findEnclosingTagRange}.
 * @param attrDef The definition of the specific attribute whose value is being completed, from the {@link TagDefinition}.
 * @param currentAttributes A record containing the names and values of attributes already present in the current tag instance, parsed by {@link TagUtils.parseAttributes}.
 * @returns A Promise resolving to an array of {@link vscode.CompletionItem} suggestions for the attribute's value, or `undefined`/empty array if no suggestions apply.
 */
export type AttributeValueProvider = (
  document: vscode.TextDocument,
  position: vscode.Position,
  tagContext: TagContext,
  attrDef: TagAttribute,
  currentAttributes: Record<string, string>
) => Promise<vscode.CompletionItem[] | undefined>;

/**
 * Defines a specific attribute for a Kentico tag.
 * Extends BaseAttribute with tag-specific properties.
 */
export interface TagAttribute extends BaseAttribute { 
  /** Is this attribute specified by position rather than name? (e.g., {% image src %}) */
  isPositional?: boolean;

  /** Should the snippet completion omit '=value'? (e.g., for boolean flags like 'border') */
  omitValueSnippet?: boolean;

  /** Delegate function to load supported values dynamically */
  loadSupportedValues?: AttributeValueProviderFn; // Uses the specific Tag signature
}

/**
 * Defines the structure, attributes, and completion behavior for a specific Kentico tag.
 */
export interface TagDefinition {
  /**
   * The unique identifier for the tag, using the {@link TagNames} enum.
   * Matches the keyword used after '{%'.
   */
  tagName: TagNames;
  /**
   * An array defining the possible attributes for this tag, using the {@link TagAttribute} interface.
   */
  attributes: TagAttribute[];
  /**
   * Function that generates the `{@link vscode.CompletionItem}`
   * used for inserting this tag as a snippet. See {@link SnippetProviderFn}.
   * If omitted, no basic snippet completion will be offered for this tag
   * by the central snippet provider.
   */
  snippetProvider: SnippetProviderFn;
  /** Optional: Specifies the *only* tag this tag can be a 
   * direct child of for snippet suggestions. */
  allowedParents?: TagNames[];
  /** Set to true if the tag requires a closing {% end... %} 
   * tag (e.g., {% code %}{% endcode %}). Defaults to false if omitted. */
  isPairTag: boolean;
  /**
     * Optional array of validation functions specific to this tag definition.
     * These rules run *in addition* to any globally registered tag validation rules.
     */
  validationRules?: TagValidationRuleFn[];
  /**
    * Optional array of document-level validation functions specific to this tag definition.
    * These rules run once per document during the document-level validation phase,
    * *in addition* to any globally registered document-level tag validation rules.
    * They receive the full list of tags found in the document.
    */
  documentValidationRules?: TagDocumentValidationRuleFn[];

  /**
     * Optional array configuring decoration providers for this tag. Each entry links
     * a provider function to a specific named decoration type (style).
     * See {@link TagDecorationProviderConfig}.
     */
  decorationProviders?: TagDecorationProviderConfig[];
}

/**
 * Represents the context within an opening tag, primarily used for attribute value completions.
 */
export interface TagContext {
  tagContent: string;         // The full text of the tag, e.g., '{% card ... %}'
  tagRange: vscode.Range;     // The range of the tag in the document
  startTagPos: vscode.Position; // The start position of the tag
}
