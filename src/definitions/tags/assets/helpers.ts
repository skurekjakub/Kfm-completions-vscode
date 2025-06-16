import * as vscode from 'vscode';
import path from 'node:path';
import fs from 'node:fs/promises'; // Keep fs import for now, might be needed elsewhere
import { getCollection } from '../../../logic/filesystem/workspaceFileLoader'; // Adjust path as needed

/**
 * Determines the appropriate MIME type for common image file extensions.
 * (This might not be strictly needed if only using file:// URIs, but keep for now)
 *
 * @param {string} extension - The file extension (e.g., '.png', '.svg').
 * @returns {string | null} The MIME type string, or null if unsupported.
 */
function getMimeType(extension: string): string | null {
    const ext = extension.toLowerCase();
    switch (ext) {
        case '.png': return 'image/png';
        case '.jpg': return 'image/jpeg';
        case '.jpeg': return 'image/jpeg';
        case '.gif': return 'image/gif';
        case '.svg': return 'image/svg+xml';
        default: return null;
    }
}

/**
 * Generates completion items for assets found relative to the current document's collection/name,
 * attempting to include image previews using direct file URIs in Markdown syntax.
 *
 * @export
 * @async
 * @param {vscode.TextDocument} document - The document for which to provide asset completions.
 * @returns {Promise<vscode.CompletionItem[]>} A promise resolving to an array of completion items.
 */
export async function getAssetCompletionsForDocument(document: vscode.TextDocument): Promise<vscode.CompletionItem[]> {
    const assetCompletions: vscode.CompletionItem[] = [];
    let collectionId = 'unknown';
    try {
        collectionId = getCollection(document.uri).collectionId;
    } catch (e) {
        console.error(`[getAssetCompletions] Error getting collection for ${document.uri.fsPath}:`, e);
        return assetCompletions;
    }

    const documentBaseName = path.basename(document.fileName).replace(path.extname(document.fileName), '');
    const assetGlob = `**/src/_docsassets/${collectionId.substring(1)}/${documentBaseName}/**`;
    console.log(`[getAssetCompletions] Searching for assets using glob: ${assetGlob}`);

    try {
        const assets = await vscode.workspace.findFiles(assetGlob);
        console.log(`[getAssetCompletions] Found ${assets.length} potential assets.`);

        for (const assetUri of assets) {
            try {
                const fsPath = assetUri.fsPath;
                const baseName = path.basename(fsPath);
                const extension = path.extname(fsPath);
                const completionValue = baseName;

                // Determine if it's a known image type
                const mimeType = getMimeType(extension);

                const item = new vscode.CompletionItem(completionValue, vscode.CompletionItemKind.File);
                item.insertText = completionValue;
                item.detail = `Asset in ${documentBaseName} folder`;
                item.preselect = true;
                item.sortText = `AAAtcmplAssets_${completionValue}`;

                // Only attempt preview if it's a recognized image type
                if (mimeType) {
                    // Convert the file system Uri to a string suitable for Markdown link
                    const fileSrc = assetUri.toString();
                    console.log(`[getAssetCompletions] Attempting preview with src: ${fileSrc}`); // Log the URI used

                    const markdownDoc = new vscode.MarkdownString(
                        `**Preview:**\n\n![${baseName}](${fileSrc})\n\n*File: ${baseName}*`
                    );
                    // Trusting the content is essential for trying to load local file URIs
                    markdownDoc.isTrusted = true;
                    item.documentation = markdownDoc;
                } else {
                    // For non-image files, just show the filename
                     item.documentation = new vscode.MarkdownString(`*File: ${baseName}*`);
                }

                assetCompletions.push(item);

            } catch (processError) {
                // Catch errors processing a single asset
                console.error(`Error processing asset file ${assetUri.fsPath}:`, processError);
                const baseName = path.basename(assetUri.fsPath);
                const errorItem = new vscode.CompletionItem(baseName, vscode.CompletionItemKind.File);
                errorItem.insertText = baseName;
                errorItem.detail = `Asset (Error processing)`;
                errorItem.sortText = `AAAtcmplAssets_${baseName}`;
                assetCompletions.push(errorItem);
            }
        }
    } catch (findError) {
        console.error(`Error finding asset files with glob ${assetGlob}:`, findError);
    }

    console.log(`[getAssetCompletions] Returning ${assetCompletions.length} completion items.`);
    return assetCompletions;
}
