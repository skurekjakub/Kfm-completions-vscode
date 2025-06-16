import * as vscode from 'vscode';
import { LANGS } from "../../../../constants";

// This helper function seems correct
export const getLangCompletions = async (): Promise<vscode.CompletionItem[]> => {
  return LANGS.map(lang => {
      const cmpl = new vscode.CompletionItem(lang, vscode.CompletionItemKind.Value);
      // Use a high-priority sort
      cmpl.sortText = `AAA_lang_${lang}`;
      cmpl.preselect = true;
      return cmpl;
  });
};
