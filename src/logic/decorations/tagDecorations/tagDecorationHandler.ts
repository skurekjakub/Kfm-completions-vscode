import * as vscode from 'vscode';
import { getTagDefinition } from '../../../definitions/definitionRegister';
import { DecorationTypeName } from '../../../definitions/tags/types'; // Import the type alias
import { decorationManager } from '../decorationTypeManager'; // Import the manager
import { MARKDOWN } from '../../../constants'; // Import language ID and TagNames if needed here
// Import the shared scanner utility and its return type
import { scanDocumentForTags } from '../../_helpers/tagScanner';// Adjust path as needed

/**
 * Updates decorations for all recognized tags within the editor's document
 * based on the `decorationProviders` defined in their respective TagDefinitions.
 *
 * @async
 * @param {vscode.TextEditor} editor - The active text editor containing the document to decorate.
 * @returns {Promise<void>}
 */
export async function updateTagDecorations(editor: vscode.TextEditor): Promise<void> {
  const document = editor.document;
  if (!editor || document.languageId !== MARKDOWN) {
    return;
  }

  console.log(`[updateTagDecorations] Starting update for: ${document.uri.fsPath}`);

  // --- Pass 1: Scan for all tags using the shared utility ---
  const { allTagsInfo } = await scanDocumentForTags(document);

  // --- Pass 2: Collect Decoration Options from Providers ---
  const collectedOptionsMap = new Map<DecorationTypeName, vscode.DecorationOptions[]>();

  for (const tagInstance of allTagsInfo) {
    const definition = getTagDefinition(tagInstance.tagName);

    if (definition?.decorationProviders && Array.isArray(definition.decorationProviders)) {
      for (const providerConfig of definition.decorationProviders) {
        const { decorationTypeName, provider } = providerConfig;
        try {
          const options = provider(tagInstance, document);
          if (options && options.length > 0) {
            const existingOptions = collectedOptionsMap.get(decorationTypeName) || [];
            existingOptions.push(...options);
            collectedOptionsMap.set(decorationTypeName, existingOptions);
          }
        } catch (e) {
          console.error(`[updateTagDecorations] Error executing decoration provider '${provider.name || 'anonymous'}' for tag '${tagInstance.tagName}' (type: ${decorationTypeName}):`, e);
        }
      }
    }
  }
  console.log(`[updateTagDecorations] Collected options for ${collectedOptionsMap.size} decoration types.`);

  // --- Pass 3: Apply Decorations ---
  // Set to keep track of decoration types that were actually applied in this run
  const appliedDecorationTypes = new Set<vscode.TextEditorDecorationType>();
  // Keep track of type names that had options generated
  const typeNamesWithOptions = new Set<DecorationTypeName>(collectedOptionsMap.keys());

  for (const [decorationTypeName, optionsArray] of collectedOptionsMap.entries()) {
    let decorationType: vscode.TextEditorDecorationType | undefined;
    try {
      // Use the new method from DecorationManager
      decorationType = decorationManager.getTypeByName(decorationTypeName);

      if (decorationType) {
        editor.setDecorations(decorationType, optionsArray);
        appliedDecorationTypes.add(decorationType); // Mark this type as applied
        console.log(`[updateTagDecorations] Applied ${optionsArray.length} decorations for type: ${decorationTypeName}`);
      } else {
        // Log if the manager didn't return a type for a name we expected
        console.warn(`[updateTagDecorations] No TextEditorDecorationType found in manager for name: ${decorationTypeName}`);
      }
    } catch (e) {
      // Catch errors during type retrieval or setting decorations
      console.error(`[updateTagDecorations] Failed to get or apply decoration type '${decorationTypeName}':`, e);
    }
  }

  // --- Pass 4: Clear Old/Unused Decorations ---
  // Clear decorations for types managed by the DecorationManager but not applied in this run.
  // Inside updateTagDecorations, Pass 4
  try {
    // Get only the type names relevant to tag decorations
    const tagDecorationTypeNames = decorationManager.getTagDecorationTypeNames(); // <-- Use new method

    for (const typeNameToClear of tagDecorationTypeNames) { // <-- Iterate specific types
      // Check if this tag-specific type did not have options generated in the current run
      if (!typeNamesWithOptions.has(typeNameToClear)) {
        const decorationType = decorationManager.getTypeByName(typeNameToClear);
        if (decorationType) {
          console.log(`[updateTagDecorations] Clearing decorations for unused tag type: ${typeNameToClear}`);
          editor.setDecorations(decorationType, []); // Clear decorations
        }
      }
    }
  } catch (e) {
    console.error(`[updateTagDecorations] Error during clearing of unused tag decoration types:`, e);
  }

  console.log(`[updateTagDecorations] Update finished for: ${document.uri.fsPath}`);
}
