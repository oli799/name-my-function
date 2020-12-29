import * as vscode from 'vscode';

export const funcTypes: vscode.QuickPickItem[] = [
	'Pure',
	'Side-effect',
].map((label) => ({ label }));

export const pureActionTypes: vscode.QuickPickItem[] = [
	'Get',
	'Add',
	'Format',
	'Remove',
	'Request',
	'Retrive',
].map((label) => ({ label }));

export const pureReturnTypes: vscode.QuickPickItem[] = [
	'List',
	'Boolean',
	'Object',
	'Number',
	'Date',
].map((label) => ({ label }));

export const sideEffectActionTypes: vscode.QuickPickItem[] = [
	'Detach',
	'Dispatch',
	'Initialize',
	'Invoke',
	'Set',
	'Take',
	'Go',
].map((label) => ({ label }));

export const trueFalseType: vscode.QuickPickItem[] = ['Yes', 'No'].map(
	(label) => ({
		label,
	})
);
