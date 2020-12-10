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
    let sourceCode = editor.document.getText();
    let regex = /@[A-Za-z]+/;
    let decorationsArray: vscode.DecorationOptions[] = [];

    const sourceCodeLines = sourceCode.split('\n');

    for (let line = 0; line < sourceCodeLines.length; line++) {
        let match = sourceCodeLines[line].match(regex);

        if (match !== null && match.index !== undefined) {
            let range = new vscode.Range(
                new vscode.Position(line, match.index),
                new vscode.Position(line, match.index + match[0].length)
            );

            let decoration = { range };
            console.log(decoration);

            decorationsArray.push(decoration);
        }
    }

    editor.setDecorations(testDecoratorType, decorationsArray);
}
