import * as vscode from 'vscode';
import { testDecoratorType } from './decoratorTypes';

export async function init() {
    let activeEditor = vscode.window.activeTextEditor;

    if (!activeEditor) {
        vscode.window.showInformationMessage('Editor does not exist!');
        return;
    }

    highlightDecorators();

    vscode.window.onDidChangeActiveTextEditor(() => {
        try {
            activeEditor = vscode.window.activeTextEditor;
            highlightDecorators();
        } catch (error) {
            vscode.window.showWarningMessage(
                'Error while trying to detect current active editor.'
            );
            console.error('Error:', error);
        }
    });

    vscode.window.onDidChangeTextEditorSelection(() => {
        activeEditor = vscode.window.activeTextEditor;
        highlightDecorators();
    });
}

function highlightDecorators(onlyActive: boolean = false) {
    try {
        if (onlyActive) {
            vscode.window.visibleTextEditors.map((editor) => {
                decorate(editor);
            });
        } else {
            vscode.window.visibleTextEditors.map((editor) => {
                if (editor !== vscode.window.activeTextEditor) {
                    return;
                }

                decorate(editor);
            });
        }
    } catch (error) {
        vscode.window.showWarningMessage(
            'Error while trying to update decorator highlights.'
        );
        console.error('Error:', error);
    }
}

function decorate(editor: vscode.TextEditor) {
    const regex = /@[A-Za-z]+/g;
    const sourceCode = editor.document.getText();
    const decorationsArray: vscode.DecorationOptions[] = [];

    const sourceCodeLines = sourceCode.split('\n');

    for (let line = 0; line < sourceCodeLines.length; line++) {
        const currentLine = sourceCodeLines[line];
        const matches = currentLine.match(regex);

        if (matches !== null) {
            if (matches.index === undefined) {
                matches.map((match) => {
                    const startPos = currentLine.indexOf(match);
                    const endPos = startPos + match.length;

                    let range = new vscode.Range(
                        new vscode.Position(line, startPos),
                        new vscode.Position(line, endPos)
                    );

                    decorationsArray.push({ range });
                });
            } else {
                let range = new vscode.Range(
                    new vscode.Position(line, matches.index),
                    new vscode.Position(line, matches.index + matches[0].length)
                );
                decorationsArray.push({ range });
            }
        }
    }

    editor.setDecorations(testDecoratorType, decorationsArray);
}
