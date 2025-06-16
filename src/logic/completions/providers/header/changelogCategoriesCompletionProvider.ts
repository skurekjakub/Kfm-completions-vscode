import * as vscode from 'vscode';
import { MARKDOWN } from '../../../../constants';
import { loadChangelogCategories } from '../../../filesystem/workspaceFileLoader';

export const changelogCategoriesCompletionProvider = vscode.languages.registerCompletionItemProvider(
  MARKDOWN,
  {
    async provideCompletionItems(document: vscode.TextDocument, position: vscode.Position) 
    {
      const line = document.lineAt(position).text;
      if (!line.match(/\s*category:.*/i)) {
        return undefined;
      }
      
      return await getChangelogCategoriesCompletions();
    }
  },
);

const getChangelogCategoriesCompletions = async (): Promise<vscode.CompletionItem[]> => {
  const cmpls: vscode.CompletionItem[] = [];
  const changelogCategories = await loadChangelogCategories();
  console.log(changelogCategories);
  changelogCategories.split('\r\n').forEach(line => {
      const item = new vscode.CompletionItem(`${line}`, vscode.CompletionItemKind.Method);
      item.insertText= `${line}`;
      item.preselect = true;
      item.sortText = 'AtcmplLcnsT';
      cmpls.push(item);
  });

  return cmpls;
};
