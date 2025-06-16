import { CompletionItem, CompletionItemKind, workspace, Uri, MarkdownString } from "vscode";
import fs from 'node:fs/promises';
import YAML from 'yaml';
import * as path from 'path';
import * as vscode from 'vscode';

import { CONFIG_PRIMARY_PATH,
         XP_ICON_DEFINITIONS,
         LICENSE_TIER_DEFINITIONS,
         XP_CHANGELOG_CATEGORIES } from "./paths";
import { JsonHeader, PrimaryConfig } from "./types";

/** Stores parsed header information for loaded documentation files. */
export const pageFileHeaders: JsonHeader[] = [];
/** Stores icon completion items loaded from Less files. */
export const iconCompletions: CompletionItem[] = [];

/** Stores the fsPath of documents that should have diagnostics run on them. */
export const allowedDiagnosticPaths = new Set<string>();

/**
 * Loads license tier definitions from the workspace.
 * @async
 * @returns {Promise<any>} A promise resolving to the parsed license tier map.
 */
export const loadLicenseTiers = async () => {
    try {
        const descriptors = await workspace.findFiles(LICENSE_TIER_DEFINITIONS);
        if (!descriptors || descriptors.length === 0) {
            console.error("[loadLicenseTiers] License tier definition file not found.");
            return {};
        }
        const fileContent = await loadFile(descriptors[0]);
        return JSON.parse(fileContent);
    } catch (error) {
        console.error("[loadLicenseTiers] Error loading or parsing license tiers:", error);
        return {};
    }
};

/**
 * Loads changelog categories from the workspace.
 * @async
 * @returns {Promise<string>} A promise resolving to the content of the categories file.
 */
/** Loads changelog categories from the workspace. */
export const loadChangelogCategories = async () => {
    try {
        const descriptors = await workspace.findFiles(XP_CHANGELOG_CATEGORIES);
        if (!descriptors || descriptors.length === 0) {
            console.error("[loadChangelogCategories] Changelog categories file not found.");
            return "";
        }
        return await loadFile(descriptors[0]);
    } catch (error) {
        console.error("[loadChangelogCategories] Error loading categories file:", error);
        return "";
    }
};

/**
 * Loads and parses headers from Markdown documentation files, filtering based
 * on the primary config file (`_config_primary.yml`) to only include collections
 * with `product_version: xbyk`. Populates `pageFileHeaders` and `allowedDiagnosticPaths`.
 * @async
 * @returns {Promise<void>}
 */
export const loadXpMdFiles = async (): Promise<void> => {
    console.log("[loadXpMdFiles] Starting scan based on config...");
    allowedDiagnosticPaths.clear();
    pageFileHeaders.length = 0;

    let targetCollectionKeys = new Set<string>();
    let collectionsDir = '_documentation'; // Default value

    // --- Step 1: Load and Parse Config File ---
    try {
        const configDescriptors = await workspace.findFiles(CONFIG_PRIMARY_PATH);
        if (!configDescriptors || configDescriptors.length === 0) {
            console.error(`[loadXpMdFiles] Primary config file not found using pattern: ${CONFIG_PRIMARY_PATH}. Cannot determine target collections.`);
            return;
        }
        const configContent = await loadFile(configDescriptors[0]);
        const configData = YAML.parse(configContent) as PrimaryConfig;

        // Read collections directory from config, use default if not specified
        if (configData?.collections_dir) {
            collectionsDir = configData.collections_dir;
        } else {
            console.warn(`[loadXpMdFiles] 'collections_dir' not found in config, using default: ${collectionsDir}`);
        }

        // --- Step 2: Identify Target Collections ---
        if (configData?.collections) {
            for (const collectionId in configData.collections) {
                if (configData.collections[collectionId]?.product_version === 'xbyk') {
                    targetCollectionKeys.add(`_${collectionId}`);
                }
            }
            console.log(`[loadXpMdFiles] Identified target collections (product_version=xbyk):`, Array.from(targetCollectionKeys));
        } else {
             console.warn(`[loadXpMdFiles] No 'collections' found in the primary config file.`);
             return;
        }

    } catch (error) {
        console.error(`[loadXpMdFiles] Error loading or parsing primary config file:`, error);
        return;
    }

    if (targetCollectionKeys.size === 0) {
        console.warn(`[loadXpMdFiles] No collections found with product_version: xbyk in the config. No files will be processed.`);
        return;
    }

    // --- Step 3: Find All Potential Files using a Dynamic Broad Glob ---
    // Construct a single glob based on the collections_dir from the config
    const broadGlobPattern = `**/src/${collectionsDir}/**/*.md`;
    console.log(`[loadXpMdFiles] Searching for files using glob: ${broadGlobPattern}`);
    let allDescriptors: Uri[] = [];
    try {
        // Find all markdown files under the base collections directory
        allDescriptors = await getFileDescriptors(broadGlobPattern);
        console.log(`[loadXpMdFiles] Found ${allDescriptors.length} potential documentation files.`);
    } catch (findError) {
         console.error(`[loadXpMdFiles] Error finding documentation files using glob ${broadGlobPattern}:`, findError);
         return;
    }

    // --- Step 4: Filter and Process Files ---
    const yamlHeaderRegex = /^\s*---\s*$(.*?)^---\s*$/ms;
    let processedCount = 0;

    for (const descriptor of allDescriptors) {
        // Determine the collection this file belongs to
        const collectionData = getCollection(descriptor); // Assumes getCollection correctly identifies based on path
        // --- FILTERING STEP ---
        // Only process files belonging to the target collections identified from the config
        if (targetCollectionKeys.has(collectionData.collectionId)) {
            try {
                const fileContent = await loadFile(descriptor);
                const headerMatch = fileContent.match(yamlHeaderRegex);
                const headerText = headerMatch?.[1];

                if (headerText) {
                    const headerParsed : Partial<JsonHeader> = YAML.parse(headerText);

                    if (headerParsed && headerParsed.identifier && headerParsed.title) {
                        const fullHeaderData: JsonHeader = {
                            title: headerParsed.title,
                            identifier: headerParsed.identifier,
                            collection: collectionData.collection,
                            collectionId: collectionData.collectionId,
                            content: fileContent,
                            fsPath: descriptor.fsPath
                        };
                        pageFileHeaders.push(fullHeaderData);
                        allowedDiagnosticPaths.add(descriptor.fsPath);
                        processedCount++;
                    }
                }
            } catch (parseError) {
                console.error(`[loadXpMdFiles] Error parsing YAML or processing file ${descriptor.fsPath}:`, parseError);
            }
        }
        // Files not in target collections are implicitly skipped
    }
    console.log(`[loadXpMdFiles] Finished processing. Added ${processedCount} files from target collections. Allowed paths for diagnostics: ${allowedDiagnosticPaths.size}`);
};

/**
 * Loads icon completions by finding SVG files in the specified directory,
 * generating previews, and constructing completion items.
 * Assumes icon names in tags use the 'xp-' prefix, but filenames do not.
 *
 * @export
 * @async
 * @returns {Promise<void>}
 */
export const loadXpIcons = async (): Promise<void> => {
    // Define the glob pattern for the SVG icon directory
    const SVG_ICON_GLOB = '**/src/_assets/svgIcons/**/*.svg'; // <-- Use new path
    iconCompletions.length = 0; // Clear existing completions
    console.log(`[loadXpIcons] Searching for SVG icons using glob: ${SVG_ICON_GLOB}`);

    try {
        const iconFiles = await workspace.findFiles(SVG_ICON_GLOB);
        console.log(`[loadXpIcons] Found ${iconFiles.length} SVG icon files.`);

        for (const fileUri of iconFiles) { // Use for...of loop
             try {
                const fsPath = fileUri.fsPath;
                const baseName = path.basename(fsPath); // e.g., 'some-icon.svg'
                const iconNameWithoutExtension = baseName.replace(path.extname(baseName), ''); // e.g., 'some-icon'

                // Assume the tag requires the 'xp-' prefix for insertion
                const insertName = `xp-${iconNameWithoutExtension}`;
                // Use the name *without* prefix as the primary label for clarity in the list
                const labelName = iconNameWithoutExtension;

                const item = new vscode.CompletionItem(labelName, vscode.CompletionItemKind.Value); // Use label without prefix
                item.insertText = insertName; // Insert the name *with* prefix
                item.detail = baseName; // Show the actual filename

                // --- Add Image Preview using file URI ---
                const fileSrc = fileUri.toString();
                const markdownDoc = new vscode.MarkdownString(
                    `**Preview:**\n\n![${labelName} preview](${fileSrc})\n\n*Icon: ${labelName}*\n*File: ${baseName}*`
                );
                markdownDoc.isTrusted = true;
                item.documentation = markdownDoc;
                // --- End Image Preview ---

                item.sortText = `AAAtcmplIcon_${labelName}`; // Sort by base name
                item.preselect = true;
                iconCompletions.push(item);

             } catch (processError) {
                 console.error(`Error processing SVG icon file ${fileUri.fsPath}:`, processError);
            }
        }
    } catch (findError) {
        console.error(`Error finding SVG icon files with glob ${SVG_ICON_GLOB}:`, findError);
    }
    console.log(`[loadXpIcons] Loaded ${iconCompletions.length} icon completions with previews.`);
};

/** Helper to load file content. */
async function loadFile(file: Uri): Promise<string> {
    try {
        return await fs.readFile(file.fsPath, 'utf-8');
    } catch (error) {
         console.error(`Error reading file ${file.fsPath}:`, error);
         throw error;
    }
}

export const loadFileByIdentifier = async (pageId: string) => {
    for (const header of pageFileHeaders) {
        if (header.identifier === pageId) {
            try {
                return await fs.readFile(header.fsPath, 'utf-8');
            } catch (error) {
                console.error(`Error reading file ${header.fsPath}:`, error);
                throw error;
            }
        }
    }
};

/** Helper to find files and sort them. */
async function getFileDescriptors(globPattern: string): Promise<Uri[]> {
    try {
        // Ensure forward slashes for glob pattern consistency
        const consistentPattern = globPattern.replace(/\\/g, '/');
        return (await workspace.findFiles(consistentPattern)).sort((a, b) => a.fsPath.localeCompare(b.fsPath));
    } catch (error) {
         console.error(`Error finding files with pattern ${globPattern}:`, error);
         throw error;
    }
}

/** Determines the collection based on file path. */
export function getCollection(descriptor: Uri): { collection: string; collectionId: string } {
    const fsPath = descriptor.fsPath;
    const separator = path.sep;
    // Improved logic: Find the collections dir and get the next segment as ID
    const collectionsBaseDir = `src${separator}_documentation${separator}`; // Use base from config if needed
    const relativePath = fsPath.substring(fsPath.indexOf(collectionsBaseDir) + collectionsBaseDir.length);
    const pathSegments = relativePath.split(separator);

    if (pathSegments.length > 0 && pathSegments[0]) {
        const collectionId = pathSegments[0];
        // You might want a mapping from ID to the 'collection' short name (DOC, GUIDE, etc.)
        // For now, let's use ID for both or derive a simple uppercase name
        const collectionName = collectionId.substring(1).toUpperCase(); // Simple derivation
        return { collection: collectionName, collectionId: collectionId };
    }

    // Fallback based on old logic if needed, or return unknown
    console.warn(`[getCollection] Could not determine collection ID from path: ${fsPath}`);
    return { collection: 'UNKNOWN', collectionId: 'unknown' };
}

// --- Functions below seem related to completions based on loaded data ---
// Define glob patterns as constants within the file scope
const CARD_MEDIA_GLOB = '**/src/_assets/svg/card-media/**/*.svg';
const TAG_ICON_GLOB = '**/src/_assets/svg/tag/**/*.svg';

/**
 * Finds SVG files in the card media directory (`src/_assets/svg/card-media/`)
 * and creates completion items for them (used for 'image' attribute in card tags),
 * attempting to include an image preview in the documentation using Data URIs.
 *
 * @export
 * @async
 * @returns {Promise<vscode.CompletionItem[]>} A promise resolving to an array of completion items.
 */
export async function getCardMediaCompletions(): Promise<vscode.CompletionItem[]> {
    const cardMediaCompletions: vscode.CompletionItem[] = [];
    console.log(`[getCardMediaCompletions] Searching using glob: ${CARD_MEDIA_GLOB}`);
    try {
        const mediaFiles = await vscode.workspace.findFiles(CARD_MEDIA_GLOB);
        console.log(`[getCardMediaCompletions] Found ${mediaFiles.length} files.`);
        for (const fileUri of mediaFiles) { // Use for...of loop
            try {
                const baseName = path.basename(fileUri.fsPath);
                const completionValue = baseName.replace(path.extname(baseName), '');

                const item = new vscode.CompletionItem(completionValue, vscode.CompletionItemKind.File);
                item.insertText = completionValue;
                item.detail = baseName;

                // --- Add Image Preview using Data URI ---
                const svgContent = await fs.readFile(fileUri.fsPath, 'utf-8');
                const base64Svg = Buffer.from(svgContent).toString('base64');
                const dataUri = `data:image/svg+xml;base64,${base64Svg}`;
                const markdownDoc = new MarkdownString(
                    `**Preview:**\n\n![${completionValue} preview](${dataUri})\n\n*File: ${baseName}*`
                );
                markdownDoc.isTrusted = true; // Allow potentially loading resources
                item.documentation = markdownDoc;

                item.sortText = `AAAtcmplCardMedia_${completionValue}`;
                item.preselect = true;
                cardMediaCompletions.push(item);
            } catch (readError) {
                 console.error(`Error reading or processing SVG file ${fileUri.fsPath}:`, readError);
            }
        }
    } catch (findError) {
        console.error("Error finding card media files:", findError);
    }
    return cardMediaCompletions;
}

/**
 * Finds SVG files in the tag icon directory (`src/_assets/svg/tag/`)
 * and creates completion items for them (used for 'icon' attribute in card tags),
 * attempting to include an image preview in the documentation using Data URIs.
 *
 * @export
 * @async
 * @returns {Promise<vscode.CompletionItem[]>} A promise resolving to an array of completion items.
 */
export async function getCardTagIconCompletions(): Promise<vscode.CompletionItem[]> {
    const tagIconCompletions: vscode.CompletionItem[] = [];
    console.log(`[getCardTagIconCompletions] Searching using glob: ${TAG_ICON_GLOB}`);
    try {
        const iconFiles = await vscode.workspace.findFiles(TAG_ICON_GLOB);
        console.log(`[getCardTagIconCompletions] Found ${iconFiles.length} files.`);
        for (const fileUri of iconFiles) { // Use for...of loop
             try {
                const baseName = path.basename(fileUri.fsPath);
                const completionValue = baseName.replace(path.extname(baseName), '');

                const item = new vscode.CompletionItem(completionValue, vscode.CompletionItemKind.File);
                item.insertText = completionValue;
                item.detail = baseName;

                // --- Add Image Preview using Data URI ---
                const svgContent = await fs.readFile(fileUri.fsPath, 'utf-8');
                const base64Svg = Buffer.from(svgContent).toString('base64');
                const dataUri = `data:image/svg+xml;base64,${base64Svg}`;
                const markdownDoc = new MarkdownString(
                    `**Preview:**\n\n![${completionValue} preview](${dataUri})\n\n*File: ${baseName}*`
                );

                markdownDoc.isTrusted = true;
                item.documentation = markdownDoc;
                item.sortText = `AAAtcmplTagIcon_${completionValue}`;
                item.preselect = true;
                tagIconCompletions.push(item);
             } catch (readError) {
                 console.error(`Error reading or processing SVG file ${fileUri.fsPath}:`, readError);
            }
        }
    } catch (findError) {
        console.error("Error finding tag icon files:", findError);
    }
    return tagIconCompletions;
}