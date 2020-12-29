import * as vscode from 'vscode';
import { init } from './checkNames';
import { collectInputs, genarateName } from './generateName';

export async function activate(context: vscode.ExtensionContext) {
	let generateName = vscode.commands.registerCommand(
		'name-my-function.genarateName',
		async () => {
			const editor = vscode.window.activeTextEditor;

			if (!editor) {
				vscode.window.showInformationMessage('Editor does not exist!');
				return;
			}

			const state = await collectInputs();
			const functionName = genarateName(state);

			editor.edit((selectedText) => {
				selectedText.replace(editor.selection, functionName);
			});

			vscode.window.showInformationMessage(`${functionName} insterted!`);
		}
	);

	let checkNames = vscode.commands.registerCommand(
		'name-my-function.checkNames',
		init
	);

	context.subscriptions.push(generateName);
	context.subscriptions.push(checkNames);
}

export function deactivate() {}
