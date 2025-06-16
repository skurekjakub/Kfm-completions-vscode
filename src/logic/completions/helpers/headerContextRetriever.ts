import * as vscode from 'vscode';

import {
    InHeaderAttributeKeyContext,
    InHeaderAttributeValueContext, InHeaderListItemValueContext,
    InHeaderNestedAttributeKeyContext, BaseHeaderContext,
    HeaderContext,
    InHeaderNestedAttributeValueContext
} from './headerContext.types';
import { markdownHeaderDefinition } from '../../../definitions/header/headerDefinition';
import { HeaderAttribute } from '../../../definitions/header/types';
import { findHeaderRange, parseHeaderContent } from './headerUtils';

// --- Helper Function Type (Optional but good practice) ---
// Defines the arguments passed to context checker helpers
type ContextCheckArgs = {
    document: vscode.TextDocument;
    position: vscode.Position;
    headerRange: vscode.Range;
    currentLine: vscode.TextLine;
    currentLineIndex: number;
    currentIndent: number;
    textBeforeCursor: string;
    trimmedTextBeforeCursor: string;
    baseContextProps: Omit<BaseHeaderContext,'contextType'|'isInHeader'> & { parsedHeader: Record<string, any> }; // Reuse base props
};

/**
 * Analyzes the cursor position within the header using line/regex analysis
 * to provide detailed context, returning a specific context type. (Refactored)
 */
export function getHeaderContext(document: vscode.TextDocument, position: vscode.Position): HeaderContext {
    const headerRange = findHeaderRange(document, position);

    // 1. Check if outside the header range OR on the '---' lines
    if (!headerRange || position.line <= headerRange.start.line || position.line >= headerRange.end.line) {
        return { contextType: 'NotInHeader', isInHeader: false };
    }

    // --- Prepare arguments for helper functions ---
    const currentLineIndex = position.line;
    const currentLine = document.lineAt(currentLineIndex);
    const baseContextProps = {
        headerRange,
        currentLineText: currentLine.text,
        currentIndentation: currentLine.firstNonWhitespaceCharacterIndex,
        cursorPositionInLine: position.character,
        parsedHeader: parseHeaderContent(document, headerRange) || {}
    };
     const contextArgs: ContextCheckArgs = {
         document,
         position,
         headerRange,
         currentLine,
         currentLineIndex,
         currentIndent: baseContextProps.currentIndentation,
         textBeforeCursor: baseContextProps.currentLineText.substring(0, baseContextProps.cursorPositionInLine),
         trimmedTextBeforeCursor: baseContextProps.currentLineText.substring(0, baseContextProps.cursorPositionInLine).trimStart(),
         baseContextProps
     };


    // --- Call helper checks in order of specificity ---

    // Check for nested value *first* as it's more specific than simple value
    let determinedContext4 = tryGetNestedAttributeValueContext(contextArgs);
    if (determinedContext4) {return determinedContext4;}

    // Check for AttributeValue first (e.g., key:| )
    let determinedContext = tryGetAttributeValueContext(contextArgs);
    if (determinedContext) {return determinedContext;}

    // Check for ListItemValue (e.g., - | or empty line under list)
    let determinedContext2 = tryGetListItemValueContext(contextArgs);
    if (determinedContext2) {return determinedContext2;}

    // Check for NestedAttributeKey (e.g., empty line under object key)
    let determinedContext3 = tryGetNestedAttributeKeyContext(contextArgs);
    if (determinedContext3) {return determinedContext3;}

    // --- Default Case ---
    // If none of the specific contexts matched, return the generic key context
    console.log("Context: Regex - Defaulting to AttributeKey context");
    const keyContext: InHeaderAttributeKeyContext = {
        ...baseContextProps, contextType: 'AttributeKey', isInHeader: true
    };
    return keyContext;
}

function tryGetAttributeValueContext(args: ContextCheckArgs): InHeaderAttributeValueContext | null {
    const { textBeforeCursor, currentIndent, baseContextProps } = args;
    // Matches if the line up to the cursor ends with 'key:' followed by optional space
    const keyValueMatch = textBeforeCursor.match(/^(\s*)(\w+):\s?$/);
    if (keyValueMatch && keyValueMatch[1].length === currentIndent) { // Key must start at line's indent
        const attributeName = keyValueMatch[2];
        const attributeDefinition = markdownHeaderDefinition.attributes.find(a => a.name === attributeName);
        console.log(`Context: Regex - In standard value position for attribute '${attributeName}'`);
        return {
            ...baseContextProps,
            contextType: 'AttributeValue',
            isInHeader: true,
            attributeName,
            attributeDefinition
        };
    }
    return null;
}

function tryGetListItemValueContext(args: ContextCheckArgs): InHeaderListItemValueContext | null {
    const { document, headerRange, currentLine, currentLineIndex, currentIndent, trimmedTextBeforeCursor, baseContextProps } = args;
    // Condition: Indented AND (Line starts with '-' or '- ' OR Line is empty/whitespace)
    if (currentIndent > 0 && (trimmedTextBeforeCursor === '-' || trimmedTextBeforeCursor === '- ' || currentLine.text.trim() === '')) {
        let parentLineIndex = currentLineIndex - 1;
        let parentName: string | undefined = undefined;
        let parentDefinition: HeaderAttribute | undefined = undefined;

        console.log(`Regex: Checking for list item context at line ${currentLineIndex + 1}, indent ${currentIndent}`);

        while (parentLineIndex > headerRange.start.line) {
             const prevLine = document.lineAt(parentLineIndex);
             const prevLineText = prevLine.text;
             if (prevLine.isEmptyOrWhitespace) { parentLineIndex--; continue; }
             const prevLineIndent = prevLine.firstNonWhitespaceCharacterIndex;

             // Check 1: Potential parent key?
             const prevLineKeyMatch = prevLineText.match(/^(\s*)(\w+):\s*.*$/);
             if (prevLineKeyMatch && prevLineIndent < currentIndent) {
                 parentName = prevLineKeyMatch[2];
                 parentDefinition = markdownHeaderDefinition.attributes.find(a => a.name === parentName);
                 if (parentDefinition?.dataType?.endsWith('[]')) { break; } // Found valid parent
                 else { parentName = undefined; parentDefinition = undefined; break; } // Found key, wrong type
             }
             // Check 2: Ignore same-level list item?
             const prevLineListItemMatch = prevLineText.match(/^(\s*)-\s.*/);
             if (prevLineListItemMatch && prevLineIndent === currentIndent) { parentLineIndex--; continue; }
             // Check 3: Blocked path?
             if (prevLineIndent >= currentIndent) { parentName = undefined; parentDefinition = undefined; break; }
             parentLineIndex--;
        }

        if (parentName && parentDefinition) {
            console.log(`Context: Regex - Determined ListItemValue for attribute '${parentName}'`);
            return {
                ...baseContextProps,
                contextType: 'ListItemValue',
                isInHeader: true,
                parentAttributeName: parentName,
                parentAttributeDefinition: parentDefinition
            };
        } else {
             console.log("Regex: Failed to determine list item parent.");
        }
    }
    return null;
}

function tryGetNestedAttributeKeyContext(args: ContextCheckArgs): InHeaderNestedAttributeKeyContext | null {
     const { document, headerRange, currentLine, currentLineIndex, currentIndent, baseContextProps } = args;
     // Condition: Line is empty or whitespace, and indentation is greater than parent key's indent
    if (currentLine.text.trim() === '' && currentIndent > 0) {
        let parentLineIndex = currentLineIndex - 1;
        let parentName: string | undefined = undefined;
        let parentDefinition: HeaderAttribute | undefined = undefined;
        let parentIndent = -1;

        // Search upwards for the closest parent key defined as an object with nested attributes
        while (parentLineIndex > headerRange.start.line) {
             const prevLine = document.lineAt(parentLineIndex);
             if (prevLine.isEmptyOrWhitespace) { parentLineIndex--; continue; }
             const prevLineIndent = prevLine.firstNonWhitespaceCharacterIndex;
             const prevLineKeyMatch = prevLine.text.match(/^(\s*)(\w+):\s*.*$/);

             if (prevLineKeyMatch && prevLineIndent < currentIndent) {
                 const key = prevLineKeyMatch[2];
                 const def = markdownHeaderDefinition.attributes.find(a => a.name === key);
                 if (def?.dataType === 'object' && def.attributes && def.attributes.length > 0) {
                      parentName = key; parentDefinition = def; parentIndent = prevLineIndent; break; // Found suitable parent
                 }
             } else if (prevLineIndent >= currentIndent) { break; } // Blocked
             parentLineIndex--;
        }

        if (parentName && parentDefinition && parentIndent !== -1) {
            const expectedIndent = parentIndent + 2; // Assuming 2-space indent for nested
            // Allow suggesting even if indent isn't perfect yet, as long as it's intended for nesting
            if (currentIndent >= parentIndent + 1) { // Must be indented more than parent
                 console.log(`Context: Determined NestedAttributeKey for parent '${parentName}'`);
                 return {
                     ...baseContextProps,
                     contextType: 'NestedAttributeKey',
                     isInHeader: true,
                     parentAttributeName: parentName,
                     parentAttributeDefinition: parentDefinition,
                     expectedIndent: expectedIndent
                 };
            } else {
                  console.log(`NestedKey: Indent ${currentIndent} not suitable for parent '${parentName}' at indent ${parentIndent}.`);
            }
        }
    }
    return null;
}

// Add a helper for nested value context
function tryGetNestedAttributeValueContext(args: ContextCheckArgs): InHeaderNestedAttributeValueContext | null {
  const { document, headerRange, currentLineIndex, currentIndent, textBeforeCursor, baseContextProps } = args;

  // Matches '  nestedKey: '
  const nestedKeyValueMatch = textBeforeCursor.match(/^(\s+)(\w+):\s?$/);
  if (nestedKeyValueMatch && nestedKeyValueMatch[1].length === currentIndent && currentIndent > 0) {
       const nestedAttributeName = nestedKeyValueMatch[2];
       let parentLineIndex = currentLineIndex - 1;
       let parentName: string | undefined = undefined;
       let parentDefinition: HeaderAttribute | undefined = undefined;

       // Search upwards for parent object key
       while (parentLineIndex > headerRange.start.line) {
            const prevLine = document.lineAt(parentLineIndex);
            if (prevLine.isEmptyOrWhitespace) { parentLineIndex--; continue; }
            const prevLineIndent = prevLine.firstNonWhitespaceCharacterIndex;
            const prevLineKeyMatch = prevLine.text.match(/^(\s*)(\w+):\s*.*$/);

            if (prevLineKeyMatch && prevLineIndent < currentIndent) {
                const key = prevLineKeyMatch[2];
                const def = markdownHeaderDefinition.attributes.find(a => a.name === key);
                // Check if it's an object type AND has nested attributes defined
                if (def?.dataType === 'object' && def.attributes && def.attributes.length > 0) {
                     // Found potential parent
                     const nestedDef = def.attributes.find(na => na.name === nestedAttributeName);
                     if (nestedDef) {
                         // Found valid parent AND the nested key exists in its definition
                         parentName = key;
                         parentDefinition = def;
                         console.log(`NestedValue: Found parent '${parentName}' for nested key '${nestedAttributeName}'`);
                         break;
                     } else {
                          console.log(`NestedValue: Found parent '${key}' but nested key '${nestedAttributeName}' not defined. Stopping search.`);
                          break; // Parent doesn't define this nested key
                     }
                } else { break; } // Found key, but not suitable parent type
            } else if (prevLineIndent >= currentIndent) { break; } // Blocked
            parentLineIndex--;
       }

       if (parentName && parentDefinition) {
            const nestedAttributeDefinition = parentDefinition.attributes?.find(a => a.name === nestedAttributeName);
            if (nestedAttributeDefinition) {
                console.log(`Context: Determined NestedAttributeValue for ${parentName}.${nestedAttributeName}`);
                return {
                    ...baseContextProps, 
                    contextType: 'NestedAttributeValue',
                    isInHeader: true,
                    parentAttributeName: parentName,
                    parentAttributeDefinition: parentDefinition,
                    nestedAttributeName: nestedAttributeName,
                    nestedAttributeDefinition: nestedAttributeDefinition
                };
            }
       }
  }
  return null;
}
