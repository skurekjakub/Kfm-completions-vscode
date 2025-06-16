// logic/completions/providers/yaml/yamlRegexContextAnalyzer.ts
import * as vscode from 'vscode';
import { moduleRootDefinition } from '../../../../definitions/yaml/rootModuleDefinition';
import { pageObjectDefinition } from '../../../../definitions/yaml/page/pageDefinition';
import { YamlObjectDefinition } from '../../../../definitions/yaml/types';
import { findDefinitionForPathRegex } from './yamlDefinitionFinder';

export type RegexContextResult = {
    path: string[];
    parentDefinition: YamlObjectDefinition | undefined;
    isKeyContext: boolean;
    isValueContext: boolean;
    currentKey: string | null;
    currentIndentation: number;
    parentIndentation: number;
    isExpectingPageKeyOnly?: boolean;
    isUnderPageListItem?: boolean;
    isInListItemObject?: boolean;
};

export function analyzeContextRegex(
    document: vscode.TextDocument,
    position: vscode.Position
): RegexContextResult | null {
    const currentLineIndex = position.line;
    if (currentLineIndex < 0) return null;

    const currentLine = document.lineAt(currentLineIndex);
    const textBeforeCursorOnCurrentLine = currentLine.text.substring(0, position.character);
    const currentIndentation = currentLine.firstNonWhitespaceCharacterIndex;
    const isCurrentLineEmpty = currentLine.isEmptyOrWhitespace;
    const isCursorAtStartOfContent = position.character <= currentIndentation;
    const currentLineTrimmedStart = currentLine.text.trimStart();

    let isKeyContext = false;
    let isValueContext = false;
    let currentKey: string | null = null;
    let path: string[] = [];
    let parentIndentation = -1;
    let parentDefinition: YamlObjectDefinition | undefined = moduleRootDefinition;
    let isExpectingPageKeyOnly = false;
    let isUnderPageListItem = false;
    let isInListItemObject = false;
    let contextDetermined = false;

    // --- Phase 1: Determine path and parent indentation ---
    let searchLineIndex = currentLineIndex - 1;
    let childIndent = currentIndentation;
    let actualParentIndent = -1;
    let governingLineIndex = -1; // Index of first line above with less indent

    while (searchLineIndex >= 0) {
        const line = document.lineAt(searchLineIndex);
        const indent = line.firstNonWhitespaceCharacterIndex;
        const lineTextTrimmed = line.text.trim();

        if (lineTextTrimmed === '' || lineTextTrimmed.startsWith('#')) {
            searchLineIndex--; continue;
        }

        if (indent < childIndent) {
            if (actualParentIndent === -1) {
                actualParentIndent = indent;
                governingLineIndex = searchLineIndex;
            }
            const keyMatch = lineTextTrimmed.match(/^(\w+):\s*.*$/);
            const keyword = keyMatch ? keyMatch[1] : null;
            if (keyword) path.unshift(keyword);
            childIndent = indent;
            if (indent === 0) break;
        }
        searchLineIndex--;
    }
    parentIndentation = actualParentIndent;


    // --- Phase 2: Refine Context based on specific structures ---

    // ---> Check for list item value context FIRST ('- key: |') <---
    const listItemValueMatch = textBeforeCursorOnCurrentLine.match(/^(\s*)-\s+(\w+):\s*$/);
    if (listItemValueMatch && !currentLineTrimmedStart.startsWith('#')) {
        console.log("[analyzeContextRegex] Detected List Item Value Context");
        isValueContext = true;
        isKeyContext = false;
        currentKey = listItemValueMatch[2]; // Key is after '- '
        contextDetermined = true;
        parentIndentation = getIndentation(listItemValueMatch[1]); // Indent of the '- key:' line

        // Determine definition based on the path calculated in Phase 1
        // This definition should represent the items within the list.
        const definitionForListItem = findDefinitionForPathRegex(path); // e.g., should return subpageObjectDefinition for path ['sequence', 'subpages']

        if (!definitionForListItem) {
            console.warn(`[analyzeContextRegex] List item value context found, but failed to find definition for path ${path.join('/')}`);
            return null; // Cannot proceed without definition
        }

        parentDefinition = definitionForListItem; // Use the found definition directly
        isInListItemObject = true; // We are inside the object defined by this list item

        // Set flags based on determined context
        if (path.includes('sequence') && currentKey === 'page') {
             isUnderPageListItem = true; // Specifically under '- page:'
        }

    } // End: if (listItemValueMatch)


    // ---> THEN, check for KEY context under '- page:' if context not already set <---
    if (!contextDetermined) {
        let isUnderActualPageLine = false;
        let pageLineIndent = -1;
        if (governingLineIndex !== -1) {
             const governingLine = document.lineAt(governingLineIndex);
             const governingTextTrimmed = governingLine.text.trim();
             if (governingTextTrimmed.startsWith('- page:')) {
                 isUnderActualPageLine = true;
                 pageLineIndent = governingLine.firstNonWhitespaceCharacterIndex;
             }
        }

        if (isUnderActualPageLine && pageLineIndent !== -1) {
              console.log(`[analyzeContextRegex] Key context governed by '- page:' on line ${governingLineIndex + 1}`);
              isUnderPageListItem = true;
              parentDefinition = pageObjectDefinition;
              parentIndentation = pageLineIndent;
              path = ['sequence', 'page']; // Explicitly set path

              const expectedKeyIndent = parentIndentation + 2;

              if (currentIndentation === expectedKeyIndent) {
                   // Determine key/value context based on current line state
                   const valueContextMatchLocal = textBeforeCursorOnCurrentLine.match(/^\s*(\w+):\s*$/);
                   const hasColonAlready = currentLineTrimmedStart.includes(':');

                   if (valueContextMatchLocal) {
                       isValueContext = true; isKeyContext = false; currentKey = valueContextMatchLocal[1];
                   } else if (!hasColonAlready) {
                       isKeyContext = true; isValueContext = false;
                   } else {
                       isKeyContext = false; isValueContext = true;
                       currentKey = currentLineTrimmedStart.match(/^(\w+):/)?.[1] || null;
                   }
              } else { // Wrong indentation under '- page:'
                   isKeyContext = false; isValueContext = false;
              }
              contextDetermined = isKeyContext || isValueContext;
        }
    } // End: if (!contextDetermined) [checking for - page: key context]


     // ---> THEN, check for sequence start context ('page:' suggestion) if context not already set <---
    if (!contextDetermined && path[path.length - 1] === 'sequence') {
          const expectedItemIndent = parentIndentation !== -1 ? parentIndentation + 2 : 0;
           if ((currentLineTrimmedStart.startsWith('-') && textBeforeCursorOnCurrentLine.trim() === '-') ||
               (isCurrentLineEmpty && currentIndentation === expectedItemIndent && isCursorAtStartOfContent)) {
               isKeyContext = false; isValueContext = false; isExpectingPageKeyOnly = true; parentDefinition = undefined; contextDetermined = true;
           } else {
                // If under sequence but none of the above match, context is unclear
                console.log("[analyzeContextRegex] Under sequence, but context unclear for item start.");
                return null;
           }
    }
    // ---> FINALLY, check general context if context not already set <---
    else if (!contextDetermined) {
         parentDefinition = findDefinitionForPathRegex(path); // Get definition based on path
         if (!parentDefinition) {
             console.log(`[analyzeContextRegex] General context: Could not find definition for path: ${path.join('/')}`);
             return null;
         }

         // Check for value context: 'key: |' (NO leading '-')
         const genericValueMatch = textBeforeCursorOnCurrentLine.match(/^(\s*)(\w+):\s*$/);
         // Ensure it's not accidentally matching list items handled above
         if (genericValueMatch && !currentLineTrimmedStart.startsWith('#') && !currentLineTrimmedStart.startsWith('-')) {
              isValueContext = true;
              isKeyContext = false;
              currentKey = genericValueMatch[2];
              // Use hierarchically determined parentIndentation
         } else {
              // Check for key context
              const expectedIndent = parentIndentation !== -1 ? parentIndentation + 2 : 0;
              if (currentIndentation === expectedIndent && (isCurrentLineEmpty || isCursorAtStartOfContent) && !currentLineTrimmedStart.startsWith('-')) {
                   isKeyContext = true;
                   isValueContext = false;
              } else {
                   isKeyContext = false;
                   isValueContext = false;
              }
         }
        contextDetermined = isKeyContext || isValueContext;
    }


    // Final check
    if (!contextDetermined) {
         console.log("[analyzeContextRegex] Could not determine valid context.");
         return null;
    }

     // Return the analysis
     const finalResult = { path, parentDefinition, isKeyContext, isValueContext, currentKey, currentIndentation, parentIndentation, isExpectingPageKeyOnly, isUnderPageListItem, isInListItemObject };
      console.log('[analyzeContextRegex FINAL RESULT]:', JSON.stringify(finalResult, (key, value) => {
          if (key === 'parentDefinition') return value ? `ObjectDef:${(value as YamlObjectDefinition).id || 'unknown'}` : undefined;
          return value;
      }, 2));
     return finalResult;
}

// Helper
function getIndentation(line: string): number {
    const match = line.match(/^\s*/);
    return match ? match[0].length : 0;
}