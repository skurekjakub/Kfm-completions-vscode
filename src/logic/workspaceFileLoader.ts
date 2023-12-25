import { CompletionItem, CompletionItemKind, workspace, Uri } from "vscode";
import fs from 'node:fs/promises'
import YAML from 'yaml';

import { XP_DOCUMENTATION_FILES, XP_ICON_DEFINITIONS } from "./constants";

export const completions: CompletionItem[] = []
export const iconCompletions: CompletionItem[] = []

export const loadXpMdFiles = async () => {
	const fileDescriptors = (await workspace.findFiles(XP_DOCUMENTATION_FILES)).sort((a, b) => a.fsPath.length - b.fsPath.length);

	const reg: RegExp = /\s*^\s*---$(.*?)^---$/ms;
	for (const descriptor of fileDescriptors) {
		console.log('processing:' + descriptor.fsPath);
		let header = await loadFile(descriptor);
		const success = header.match(reg);
		header = success?.[1] ? success[1] : '';
		const jsonHeader = YAML.parse(header);
		const completion = new CompletionItem(`${jsonHeader.title}--${jsonHeader.identifier}`, CompletionItemKind.Enum);
		completion.insertText = `${jsonHeader.identifier}`;
		completion.preselect = true;
		completion.sortText = 'AtcmplPgLnk';
		completions.push(completion);
	};
}

export const loadXpIcons = async () => {
	const xpFileDescriptor = (await workspace.findFiles(XP_ICON_DEFINITIONS))[0]
	const xpDefinition = await fs.readFile(xpFileDescriptor.fsPath, 'utf-8');
	xpDefinition.split('\n').forEach(line => {
		if (line.match(/^\.xp-/gi))
		{
			const cmpl = new CompletionItem(`${line.match(/^\.(xp.*):bef/)?.[1]}`, CompletionItemKind.Value);
			cmpl.sortText = "AtcmplIcn"
			cmpl.preselect = true
			iconCompletions.push(cmpl)
		}
	})
}

async function loadFile(file: Uri) {
    return await fs.readFile(file.fsPath, 'utf-8');
}