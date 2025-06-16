import * as vscode from 'vscode';
import { TagAttribute, TagDefinition } from '../../../definitions/tags/types'; 
import { TagNames } from '../../../constants';

/**
 * Context passed to each tag validation rule function.
 * Encapsulates all necessary information about the tag instance being checked.
 */
export interface TagValidationContext {
    /** The document being validated. */
    document: vscode.TextDocument;
    // The current editor
    editor: vscode.TextEditor;
    /** The definition object for the tag type (e.g., card, code). */
    tagDefinition: TagDefinition;
    /** Information about the specific tag instance found in the document. */
    tagInstance: TagInstanceInfo
    /** Optional: The TagNames enum value of the immediate enclosing parent tag, if applicable and found. */
    parentTagName?: TagNames; // Using the TagNames enum type directly might require importing it if not already via TagDefinition
    // Consider adding:
    // - Full parsed document structure (if needed by complex rules)?
    // - Stack information (if rules need to know about siblings/nesting depth beyond immediate parent)?
    /**
     * Optional: If the current tagInstance is a closing tag, this property
     * holds information about its corresponding opening tag instance found earlier.
     * Used for rules that need to compare opening and closing tags (e.g., indentation).
     */
    matchingOpeningTag?: TagInstanceInfo;
}

/**
 * Holds key information about a specific tag instance found in the document.
 */
export interface TagInstanceInfo {
    /** The full text of the tag, e.g., '{% card title="x" %}' or '{% endcard %}' */
    tagText: string;
    /** The range (start and end position) of the tag instance in the document. */
    tagRange: vscode.Range;
    /** The parsed attributes (key-value pairs) of the opening tag. Empty for closing tags. */
    attributes: Record<string, string>;
    /** True if this instance is an opening tag, false otherwise. */
    isOpeningTag: boolean;
     /** True if this instance is a closing tag, false otherwise. */
    isClosingTag: boolean;
    /** The calculated indentation level (number of leading spaces/tabs) of the line the tag starts on. */
    indentation: number;
    /** The name of the tag */
    tagName: TagNames; // Use TagNames enum type
}

/**
 * Defines the signature for a function that validates the document globally
 * based on the collection of all tags found.
 *
 * @param document The document being validated.
 * @param allTagsInfo An array containing information about every tag instance found in the document.
 * @param finalTagStack The final state of the tag stack after processing all tags,
 * useful for rules like checking unclosed tags. The stack items contain TagInstanceInfo.
 * @param mismatchedClosingTags A list of closing tags that were encountered but did not
 * match the expected opening tag on the stack.
 * @returns An array of diagnostics found by the rule.
 */
export type TagDocumentValidationRuleFn = (
    document: vscode.TextDocument,
    allTagsInfo: Readonly<TagInstanceInfo[]>, // Make input readonly
    finalTagStack?: Readonly<TagInstanceInfo[]>, // Make stack readonly and optional
    mismatchedClosingTags?: Readonly<TagInstanceInfo[]>
) => vscode.Diagnostic[];

/**
 * Defines the signature for a function that validates a specific aspect of a tag.
 * Each rule receives the validation context and returns an array of diagnostics.
 * The array should be empty if the rule finds no issues.
 */
export type TagValidationRuleFn = (context: TagValidationContext) => vscode.Diagnostic[];
