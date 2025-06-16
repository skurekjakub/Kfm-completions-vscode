import * as vscode from 'vscode';
import * as fsspath from 'path';
import { YamlAttributeValueProviderFn } from './types';
import { pageFileHeaders } from '../../logic/filesystem/workspaceFileLoader';
import { JsonHeader } from '../../logic/filesystem/types';
// Assuming utils are now in a separate file or adjust path as needed
import { createHeadingCompletion, findKeyLineAndIndent, findSiblingKeyValue, getIndentation } from './utils';

const MARKDOWN_HEADING_REGEX = /^#{1,6}\s+(.*)/gm;

export const getYamlHeadingCompletions: YamlAttributeValueProviderFn = async (
    document,
    position,
    path
) => {
    console.log(`[getYamlHeadingCompletions] Triggered for path: ${path.join('/')}`);
    const completions: vscode.CompletionItem[] = [];
    const currentLineIndex = position.line;
    const currentLine = document.lineAt(currentLineIndex);
    const currentIndent = getIndentation(currentLine.text); // Indent where completion is requested

    // --- Determine if we are adding to an existing list ---
    let isAddingToList = false;
    let expectedListItemIndent = -1;
    // Find the 'exclude:' key line above the current position
    const excludeKeyInfo = findKeyLineAndIndent(document, currentLineIndex -1, 'exclude');

    if (excludeKeyInfo) {
        expectedListItemIndent = excludeKeyInfo.indent + 2; // Default list item indent
        // Check the line right above the cursor
        if (currentLineIndex > 0) {
            const prevLine = document.lineAt(currentLineIndex - 1);
            const prevLineIndent = getIndentation(prevLine.text);
            // If previous line has the expected list item indent AND starts with '-'
            if (!prevLine.isEmptyOrWhitespace && prevLineIndent === expectedListItemIndent && prevLine.text.trim().startsWith('-')) {
                isAddingToList = true;
                console.log(`[getYamlHeadingCompletions] Detected adding to list for 'exclude'.`);
            }
        }
        // Also handle case where the *current* empty line is ready for the *first* list item
        else if (currentLine.isEmptyOrWhitespace && currentIndent === expectedListItemIndent && position.character === currentIndent) {
             isAddingToList = true; // Treat as adding the first item
             console.log(`[getYamlHeadingCompletions] Detected starting list for 'exclude'.`);
        }
    }
    // --- End List Detection ---


    // 1. Find sibling 'identifier'/'collection' or 'filename'
    // Need the indent of the *block* containing 'exclude', not necessarily currentIndent
    const blockIndent = excludeKeyInfo ? excludeKeyInfo.indent : currentIndent; // Use exclude key indent if found
    const identifier = findSiblingKeyValue(document, currentLineIndex, blockIndent, 'identifier');
    const collection = findSiblingKeyValue(document, currentLineIndex, blockIndent, 'collection');
    const filename = findSiblingKeyValue(document, currentLineIndex, blockIndent, 'filename');

    console.log(`[getYamlHeadingCompletions] Found siblings: id='${identifier}', coll='${collection}', file='${filename}'`);

    // 2. Find Corresponding JsonHeader entry & Content
    let matchedHeader: JsonHeader | undefined;
    // ... (logic to find matchedHeader using filename or id/collection remains the same) ...
    if (filename) {
        let resolvedFsPath: string | undefined;
         try {
             const currentDir = fsspath.dirname(document.uri.fsPath);
             resolvedFsPath = fsspath.resolve(currentDir, filename);
             console.log(`[getYamlHeadingCompletions] Resolved filename to fsPath: ${resolvedFsPath}`);
         } catch (e) {
              console.error(`[getYamlHeadingCompletions] Error resolving relative filename '${filename}':`, e);
         }
         if (resolvedFsPath) {
            matchedHeader = pageFileHeaders.find(h => h.fsPath === resolvedFsPath);
         }
    } else if (identifier && collection) {
        matchedHeader = pageFileHeaders.find(header =>
            header.identifier === identifier &&
            (header.collectionId.startsWith('_') ? header.collectionId.substring(1) : header.collectionId) === collection
        );
    }

    let fileContent: string | undefined;
    if (matchedHeader) {
        console.log(`[getYamlHeadingCompletions] Found matched header in cache: id=${matchedHeader.identifier}, path=${matchedHeader.fsPath}`);
        fileContent = matchedHeader.content;
    } else {
         console.log("[getYamlHeadingCompletions] No matching header found in cache.");
    }

    // 3. Create Completions (passing list context)

    // Add default 'start' and 'end' regardless of finding content
    // Pass 'isAddingToList' flag to the helper
    completions.push(createHeadingCompletion('start', 'AAA', isAddingToList));
    completions.push(createHeadingCompletion('end', 'AAA', isAddingToList));
    const addedHeadings = new Set<string>(['start', 'end']);

    if (!fileContent) {
        console.log("[getYamlHeadingCompletions] No file content available to extract headings.");
        return completions; // Return only defaults
    }

    // 4. Extract Headings & Create Completions from cached content
    console.log(`[getYamlHeadingCompletions] Extracting headings from cached content for ${matchedHeader?.fsPath}`);
    let matchRegex;
    while ((matchRegex = MARKDOWN_HEADING_REGEX.exec(fileContent)) !== null) {
        const headingText = matchRegex[1].trim();
        const cleanedHeading = headingText.replace(/\[([^\]]+)\]\([^)]+\)/g, '$1');
        if (cleanedHeading && !addedHeadings.has(cleanedHeading)) {
            // Pass 'isAddingToList' flag to the helper
            completions.push(createHeadingCompletion(cleanedHeading, 'ZZZ', isAddingToList));
            addedHeadings.add(cleanedHeading);
        }
    }

    console.log(`[getYamlHeadingCompletions] Found ${completions.length} total suggestions (incl. defaults).`);
    return completions.length > 0 ? completions : undefined;
};