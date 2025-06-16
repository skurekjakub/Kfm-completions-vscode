import * as vscode from 'vscode';

import { MARKDOWN } from "../../../../constants";
import { loadLicenseTiers } from '../../../filesystem/workspaceFileLoader';

export const licenseTierCompletionProvider = vscode.languages.registerCompletionItemProvider(
  MARKDOWN,
  {
    async provideCompletionItems(document: vscode.TextDocument, position: vscode.Position) 
    {
      const line = document.lineAt(position).text;
      if (!line.match(/\s*license:.*/i)) {
        return undefined;
      }
      
      return await getLicenseTierCompletions();
    }
  },
);

const getLicenseTierCompletions = async (): Promise<vscode.CompletionItem[]> => {
  const cmpls: vscode.CompletionItem[] = [];
  const tiers = await loadLicenseTiers();
  console.log(tiers);
  Object.keys(tiers).forEach(key => {
      const item = new vscode.CompletionItem(`License tier: ${key}--${tiers[key].tier}`, vscode.CompletionItemKind.Method);
      item.insertText = `${key}`;
      item.preselect = true;
      item.sortText = 'AtcmplLcnsT';
      cmpls.push(item);
  });

  return cmpls;
};
