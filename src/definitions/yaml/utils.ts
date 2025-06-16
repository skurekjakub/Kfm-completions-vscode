import * as vscode from 'vscode';
import * as path from 'path';

/** Gets the indentation level of a line */
export function getIndentation(line: string): number {
  const match = line.match(/^\s*/);
  return match ? match[0].length : 0;
}

// Example implementation for yamlProviderUtils.ts
export function findKeyLineAndIndent(
     document: vscode.TextDocument,
     startLineIndex: number, // Start searching from the line *before* this index
     keyToFind: string
 ): { line: number, indent: number } | undefined {
     for (let i = startLineIndex; i >= 0; i--) {
         const line = document.lineAt(i);
         const textTrimmed = line.text.trim();
         if (textTrimmed.startsWith(`${keyToFind}:`)) {
              return { line: i, indent: line.firstNonWhitespaceCharacterIndex };
         }
          // Optimization: stop searching upwards if indentation decreases significantly?
          // Depends on YAML structure constraints.
     }
     return undefined;
 }

/**
 * Helper to create a completion item for a heading.
 * @param heading The heading text.
 * @param sortPrefix Prefix for sorting suggestions.
 * @param isListItem If true, formats the suggestion as a YAML list item.
 */
export function createHeadingCompletion(
     heading: string,
     sortPrefix: string = 'ZZZ',
     isListItem: boolean = false // Add boolean flag
 ): vscode.CompletionItem {
      // Quote the heading text, escaping internal single quotes
      const quotedHeading = `'${heading.replace(/'/g, "''")}'`;
      // Prepend list marker if needed
      const insertText = quotedHeading;
 
      const item = new vscode.CompletionItem(heading, vscode.CompletionItemKind.EnumMember);
      item.insertText = insertText; // Use potentially list-formatted text
      item.label = insertText;
      item.detail = `Markdown Heading${isListItem ? ' (List Item)' : ''}`; // Adjust detail
      item.sortText = `${sortPrefix}_${heading}`;
      // Optional: Add extra indent/newline if inserting list item?
      // item.additionalTextEdits = isListItem ? [vscode.TextEdit.insert(position, '\n' + ' '.repeat(indent))] : undefined; // Requires position & indent
      return item;
 }

/**
* Finds the value of a sibling key within the same YAML block.
* Scans up and down from the starting line index.
*/
export function findSiblingKeyValue(document: vscode.TextDocument, startLineIndex: number, keyIndent: number, keyToFind: string): string | undefined {
  let parentIndent = -1;
   // Find parent indent first
   for (let i = startLineIndex - 1; i >= 0; i--) {
        const line = document.lineAt(i);
        const indent = getIndentation(line.text);
        if (!line.isEmptyOrWhitespace && !line.text.trim().startsWith('#')) {
             if (indent < keyIndent) {
                  parentIndent = indent;
                  break;
             }
        }
   }

   const searchLines = (startIndex: number, direction: number): string | undefined => {
        for (let i = startIndex; i >= 0 && i < document.lineCount; i += direction) {
             const line = document.lineAt(i);
             const indent = getIndentation(line.text);
             const textTrimmed = line.text.trim();

             if (textTrimmed === '' || textTrimmed.startsWith('#')) {continue;}

              // Stop if we go outside the block (indent decreased past parent)
              if (indent <= parentIndent && parentIndent !== -1) {
                   // If scanning down, stop immediately. If scanning up, need to check if this IS the parent.
                    if (direction === 1 || i !== startLineIndex -1) {return undefined;} // Stop scanning if indent decreases
              }

             // Check lines at the same indentation level as the original key OR the list item indent level
             // (keys like identifier/filename might be siblings of start/end under '- page:')
             if (indent === keyIndent || indent === parentIndent + 2) { // Check keyIndent and potential list item sibling indent
                 const match = textTrimmed.match(/^(\w+):\s*(?:'(.*?)'|"(.*?)"|([^#\s]+))\s*(#.*)?$/); // Match key: 'value' or key: "value" or key: value
                 if (match && match[1] === keyToFind) {
                     return match[2] ?? match[3] ?? match[4]; // Return captured value
                 }
             }
        }
        return undefined;
   };

   // Scan upwards (excluding current line)
   let value = searchLines(startLineIndex -1, -1);
   if (value !== undefined) {return value;}

   // Scan downwards (excluding current line)
   value = searchLines(startLineIndex + 1, 1);
   return value;
}
