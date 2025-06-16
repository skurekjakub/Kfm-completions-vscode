import * as vscode from 'vscode';
import { HeaderContext } from '../../../logic/completions/helpers/headerContext.types';
import { HeaderAttribute } from './../types';
import { loadLicenseTiers } from '../../../logic/filesystem/workspaceFileLoader';

// Adapts loadLicenseTiers to the new provider signature
export async function getLicenseCompletions(
    document: vscode.TextDocument,
    position: vscode.Position,
    headerContext: HeaderContext,
    attrDef: HeaderAttribute,
    currentAttributes: Record<string, any>
): Promise<vscode.CompletionItem[] | undefined> {
    try {
        const tiers = await loadLicenseTiers(); // [cite: 731]
        return Object.keys(tiers).map(key => {
            const item = new vscode.CompletionItem(
                `${key}: ${tiers[key]?.tier || 'Unknown Tier'}`, // Improved label
                vscode.CompletionItemKind.Value
            );
            item.insertText = `${key}`; // Insert just the key
            item.detail = `License Tier: ${tiers[key]?.tier}`;
            item.sortText = `A_${key}`;
            item.preselect = true;
            return item;
        });
    } catch (error) {
        console.error("Error loading license tier completions:", error);
        return undefined;
    }
}
