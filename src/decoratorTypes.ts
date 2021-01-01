import * as vscode from 'vscode';

export const highlightRules = vscode.window.createTextEditorDecorationType({
	fontWeight: 'bold',
	color: '#f0db4f',
});

export const highlightProblems = vscode.window.createTextEditorDecorationType({
	backgroundColor: '#FFBC034D',
});
