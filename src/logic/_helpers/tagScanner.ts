import * as vscode from 'vscode';
import { TagInstanceInfo } from '../diagnostics/tags/types'; // Adjust path as needed
import { TagNames } from '../../constants'; // Adjust path as needed
import { getTagDefinition } from '../../definitions/definitionRegister'; // Adjust path as needed & import TagDefinition
import { TagUtils } from '../_helpers/tagUtils'; // Adjust path as needed
import { TagDefinition } from '../../definitions/tags/types';

/**
 * Defines the structure for the result returned by scanDocumentForTags.
 */
export interface TagScanResult {
    /** An array containing information about every recognized tag instance found. */
    allTagsInfo: TagInstanceInfo[];
    /** A map containing the unique TagDefinition objects encountered during the scan, keyed by TagName. */
    uniqueTagDefinitions: Map<TagNames, TagDefinition>;
}

/**
 * Scans the document and collects information about all recognized tag instances
 * and the unique tag definitions encountered.
 * This utility is intended to be shared between diagnostics and decoration handlers.
 *
 * @async Potentially async if tag parsing becomes async in the future.
 * @param {vscode.TextDocument} document - The document to scan.
 * @returns {Promise<TagScanResult>} A promise resolving to an object containing both the list of all tag instances and a map of unique tag definitions found.
 */
export async function scanDocumentForTags(document: vscode.TextDocument): Promise<TagScanResult> {
    const allTagsInfo: TagInstanceInfo[] = [];
    // Initialize the map to store unique definitions
    const uniqueTagDefinitions = new Map<TagNames, TagDefinition>();
    const text = document.getText();
    // Regex to find all start {% tag ... %} and end {% endtag %} tags
    const tagRegex = /\{%\s*(end)?(\w+)\s*.*?%\}/gis;
    let match;

    console.log(`[scanDocumentForTags] Scanning document: ${document.uri.fsPath}`);

    while ((match = tagRegex.exec(text)) !== null) {
        const isEndTag = !!match[1];
        const tagName = match[2] as TagNames;
        const matchStartIndex = match.index;
        const matchEndIndex = matchStartIndex + match[0].length;
        const range = new vscode.Range(document.positionAt(matchStartIndex), document.positionAt(matchEndIndex));
        const tagText = match[0];

        // Attempt to get definition; skip if tag is not defined/recognized
        const definition = getTagDefinition(tagName);
        if (!definition) {
            continue; // Skip tags that aren't defined in our system
        }

        // Add definition to the map if it's the first time we've seen this tag type
        if (!uniqueTagDefinitions.has(tagName)) {
            uniqueTagDefinitions.set(tagName, definition);
        }

        const startLine = document.lineAt(range.start.line);
        const indentation = startLine.firstNonWhitespaceCharacterIndex;

        // Parse attributes only for opening tags
        let attributes = {};
        if (!isEndTag) {
            try {
                attributes = TagUtils.parseAttributes(tagText);
            } catch (e) {
                console.error(`[scanDocumentForTags] Error parsing attributes for tag '${tagName}' at range ${range.start.line}:${range.start.character}:`, e);
            }
        }

        const currentTagInstanceInfo: TagInstanceInfo = {
            tagText,
            tagRange: range,
            attributes,
            isOpeningTag: !isEndTag,
            isClosingTag: isEndTag,
            indentation,
            tagName
        };
        allTagsInfo.push(currentTagInstanceInfo);
    }
    console.log(`[scanDocumentForTags] Scan complete. Found ${allTagsInfo.length} defined tag instances of ${uniqueTagDefinitions.size} unique types.`);

    // Return both the list and the map
    return { allTagsInfo, uniqueTagDefinitions };
}
