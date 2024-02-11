import { CompletionItem, CompletionItemKind, workspace, Uri } from "vscode";
import fs from 'node:fs/promises'
import YAML from 'yaml';

import { XP_DOCUMENTATION_FILES,
         API_DOCUMENTATION_FILES,   
         TUTORIAL_DOCUMENTATION_FILES,
         XP_ICON_DEFINITIONS } from "./constants";

export const pageIdCompletions: CompletionItem[] = []
export const iconCompletions: CompletionItem[] = []

export const loadXpMdFiles = async () => {
	const xpFileDescriptors = await getFileDescriptors(XP_DOCUMENTATION_FILES);
    const tutorialFileDescriptors = await getFileDescriptors(TUTORIAL_DOCUMENTATION_FILES);
    const apiFileDescriptors = await getFileDescriptors(API_DOCUMENTATION_FILES);

	const reg: RegExp = /\s*^\s*---$(.*?)^---$/ms;
	for (const descriptor of xpFileDescriptors.concat(tutorialFileDescriptors).concat(apiFileDescriptors)) {
		console.log('processing:' + descriptor.fsPath);
		let header = await loadFile(descriptor);
		const success = header.match(reg);
		header = success?.[1] ? success[1] : '';
		const jsonHeader = YAML.parse(header);
		const completion = new CompletionItem(`${jsonHeader.title}--${jsonHeader.identifier} (${getCollection(descriptor)})`, CompletionItemKind.Enum);
		completion.insertText = `${jsonHeader.identifier}`;
		completion.preselect = true;
		completion.sortText = 'AtcmplPgLnk';
		pageIdCompletions.push(completion);
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

async function getFileDescriptors(path: string) {
    return (await workspace.findFiles(path)).sort((a, b) => a.fsPath.length - b.fsPath.length);
}

export function getCollection(descriptor: Uri) {
    const collection = descriptor.fsPath.includes('_xp') ? 'xp' : descriptor.fsPath.includes('_tutorial') ? 'tutorial' : 'api';
    return collection;
}
