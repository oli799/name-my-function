import * as vscode from 'vscode';
import {
    funcTypes,
    pureActionTypes,
    pureReturnTypes,
    sideEffectActionTypes,
    trueFalseType,
} from './options';

export async function activate(context: vscode.ExtensionContext) {
    interface State {
        reactHook: boolean;
        ninjaCode: boolean;
        funcType: vscode.QuickPickItem | string;
        pureActionType: vscode.QuickPickItem | string;
        sideEffectActionType: vscode.QuickPickItem | string;
        pureReturnType: vscode.QuickPickItem | string | undefined;
        funcName: string;
    }

    interface NameBricks {
        funcType: string;
        returnType?: string;
        prefix: string;
        funcName: string;
    }

    async function collectInputs() {
        const state = {} as Partial<State>;
        await MultiStepInput.run((input) => pickFuncType(input, state));
        return state as State;
    }

    const title = 'Generate Function Name';

    async function pickFuncType(input: MultiStepInput, state: Partial<State>) {
        const pick = await input.showQuickPick({
            title,
            step: 1,
            totalSteps: 6,
            placeholder: 'What is the type of function?',
            items: funcTypes,
            shouldResume: shouldResume,
        });

        state.funcType = pick.label;

        if (pick.label === 'Pure') {
            return (input: MultiStepInput) => pickPureActionType(input, state);
        } else {
            return (input: MultiStepInput) =>
                pickSideEffectActionType(input, state);
        }
    }

    async function pickSideEffectActionType(
        input: MultiStepInput,
        state: Partial<State>
    ) {
        const pick = await input.showQuickPick({
            title,
            step: 2,
            totalSteps: 5,
            placeholder: 'How would you describe the action of the function?',
            items: sideEffectActionTypes,
            shouldResume: shouldResume,
        });

        state.sideEffectActionType = pick.label;

        return (input: MultiStepInput) => pickFuncName(input, state);
    }

    async function pickPureActionType(
        input: MultiStepInput,
        state: Partial<State>
    ) {
        const pick = await input.showQuickPick({
            title,
            step: 2,
            totalSteps: 6,
            placeholder: 'How would you describe the action of the function?',
            items: pureActionTypes,
            shouldResume: shouldResume,
        });

        state.pureActionType = pick.label;

        return (input: MultiStepInput) => pickPureReturnType(input, state);
    }

    async function pickPureReturnType(
        input: MultiStepInput,
        state: Partial<State>
    ) {
        const pick = await input.showQuickPick({
            title,
            step: 3,
            totalSteps: 6,
            placeholder: 'What is the return?',
            items: pureReturnTypes,
            shouldResume: shouldResume,
        });

        state.pureReturnType = pick.label;

        return (input: MultiStepInput) => pickFuncName(input, state);
    }

    async function pickFuncName(input: MultiStepInput, state: Partial<State>) {
        state.funcName = await input.showInputBox({
            title,
            step: 2,
            totalSteps: 4,
            value: typeof state.funcName === 'string' ? state.funcName : '',
            prompt: 'Where will data come from?',
            validate: validateName,
            shouldResume: shouldResume,
        });

        return (input: MultiStepInput) => isReactHook(input, state);
    }

    async function isReactHook(input: MultiStepInput, state: Partial<State>) {
        const pick = await input.showQuickPick({
            title,
            step: 1,
            totalSteps: 3,
            placeholder: 'Is it a React Hook?',
            items: trueFalseType,
            shouldResume: shouldResume,
        });

        if (pick.label === 'Yes') {
            state.reactHook = true;
        } else {
            state.reactHook = false;
        }

        return (input: MultiStepInput) => isNinja(input, state);
    }

    async function isNinja(input: MultiStepInput, state: Partial<State>) {
        const pick = await input.showQuickPick({
            title,
            step: 1,
            totalSteps: 3,
            placeholder: 'Ninja mode',
            items: trueFalseType,
            shouldResume: shouldResume,
        });

        if (pick.label === 'Yes') {
            state.ninjaCode = true;
        } else {
            state.ninjaCode = false;
        }
    }

    function shouldResume() {
        // Could show a notification with the option to resume.
        return new Promise<boolean>((resolve, reject) => {
            // noop
        });
    }

    async function validateName(name: string) {
        var exp = new RegExp('^[A-Za-z]+$');

        if (exp.test(name)) {
            return undefined;
        } else {
            return 'Please use only alphabetical characters!';
        }
    }

    function genarateName(state: State) {
        /* pure type:  
		funcType: 'Pure';
        pureActionType: 'Get';
        pureReturnType: 'List';
        funcName: 'test';
        reactHook: false;
		ninjaCode: false; */

        /* sideEffect type:  
		funcType:"Side-effect"
		sideEffectActionType:"Dispatch"
		funcName:"test"
		reactHook:false
		ninjaCode:false */

        const funcType = state.funcType;
        const funcName = state.funcName;
        const isReactHook = state.reactHook;
        const isNinjaCode = state.ninjaCode;
        let actionType = state.pureActionType
            ? state.pureActionType
            : state.sideEffectActionType;
        let returnType = state.pureActionType
            ? state.pureReturnType
            : undefined;

        let nameBricks: NameBricks = {
            funcType: actionType.toString(),
            returnType: returnType?.toString(),
            prefix: funcType === 'Pure' ? 'from' : 'on',
            funcName: funcName.toString(),
        };

        if (returnType === 'Boolean') {
            nameBricks.funcType = 'Is';
            nameBricks.returnType = '';
        }

        if (nameBricks.funcType === 'Initialize') {
            nameBricks.funcType = 'Init';
        }

        if (isNinjaCode) {
            nameBricks.returnType = 'data';
            nameBricks.funcName = '';
            nameBricks.prefix = '';
            nameBricks.funcType = nameBricks.funcType = nameBricks.funcType
                .split('')
                .filter((e, i) => {
                    if (i === 0 && e.match(/(a|e|i|o|u)/gi)) {
                        return true;
                    }

                    if (e.match(/(a|e|i|o|u)/gi)) {
                        return false;
                    }

                    return true;
                })
                .join('');
        }

        let final = [
            nameBricks.funcType,
            nameBricks.returnType,
            nameBricks.prefix,
            nameBricks.funcName,
        ];

        if (isReactHook) {
            final = ['use', ...final];
        }

        return toCamelCase(final.join('-'));
    }

    function toCamelCase(text: string) {
        text = text.replace(/[-_\s.]+(.)?/g, (_, c) =>
            c ? c.toUpperCase() : ''
        );
        return text.substr(0, 1).toLowerCase() + text.substr(1);
    }

    let disposable = vscode.commands.registerCommand(
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

    context.subscriptions.push(disposable);
}

class InputFlowAction {
    static back = new InputFlowAction();
    static cancel = new InputFlowAction();
    static resume = new InputFlowAction();
}

type InputStep = (input: MultiStepInput) => Thenable<InputStep | void>;

interface QuickPickParameters<T extends vscode.QuickPickItem> {
    title: string;
    step: number;
    totalSteps: number;
    items: T[];
    activeItem?: T;
    placeholder: string;
    buttons?: vscode.QuickInputButton[];
    shouldResume: () => Thenable<boolean>;
}

interface InputBoxParameters {
    title: string;
    step: number;
    totalSteps: number;
    value: string;
    prompt: string;
    validate: (value: string) => Promise<string | undefined>;
    buttons?: vscode.QuickInputButton[];
    shouldResume: () => Thenable<boolean>;
}

class MultiStepInput {
    static async run<T>(start: InputStep) {
        const input = new MultiStepInput();
        return input.stepThrough(start);
    }

    private current?: vscode.QuickInput;
    private steps: InputStep[] = [];

    private async stepThrough<T>(start: InputStep) {
        let step: InputStep | void = start;
        while (step) {
            this.steps.push(step);
            if (this.current) {
                this.current.enabled = false;
                this.current.busy = true;
            }
            try {
                step = await step(this);
            } catch (err) {
                if (err === InputFlowAction.back) {
                    this.steps.pop();
                    step = this.steps.pop();
                } else if (err === InputFlowAction.resume) {
                    step = this.steps.pop();
                } else if (err === InputFlowAction.cancel) {
                    step = undefined;
                } else {
                    throw err;
                }
            }
        }
        if (this.current) {
            this.current.dispose();
        }
    }

    async showQuickPick<
        T extends vscode.QuickPickItem,
        P extends QuickPickParameters<T>
    >({
        title,
        step,
        totalSteps,
        items,
        activeItem,
        placeholder,
        buttons,
        shouldResume,
    }: P) {
        const disposables: vscode.Disposable[] = [];
        try {
            return await new Promise<
                T | (P extends { buttons: (infer I)[] } ? I : never)
            >((resolve, reject) => {
                const input = vscode.window.createQuickPick<T>();
                input.title = title;
                input.step = step;
                input.totalSteps = totalSteps;
                input.placeholder = placeholder;
                input.items = items;
                if (activeItem) {
                    input.activeItems = [activeItem];
                }
                input.buttons = [
                    ...(this.steps.length > 1
                        ? [vscode.QuickInputButtons.Back]
                        : []),
                    ...(buttons || []),
                ];
                disposables.push(
                    input.onDidTriggerButton((item) => {
                        if (item === vscode.QuickInputButtons.Back) {
                            reject(InputFlowAction.back);
                        } else {
                            resolve(<any>item);
                        }
                    }),
                    input.onDidChangeSelection((items) => resolve(items[0])),
                    input.onDidHide(() => {
                        (async () => {
                            reject(
                                shouldResume && (await shouldResume())
                                    ? InputFlowAction.resume
                                    : InputFlowAction.cancel
                            );
                        })().catch(reject);
                    })
                );
                if (this.current) {
                    this.current.dispose();
                }
                this.current = input;
                this.current.show();
            });
        } finally {
            disposables.forEach((d) => d.dispose());
        }
    }

    async showInputBox<P extends InputBoxParameters>({
        title,
        step,
        totalSteps,
        value,
        prompt,
        validate,
        buttons,
        shouldResume,
    }: P) {
        const disposables: vscode.Disposable[] = [];
        try {
            return await new Promise<
                string | (P extends { buttons: (infer I)[] } ? I : never)
            >((resolve, reject) => {
                const input = vscode.window.createInputBox();
                input.title = title;
                input.step = step;
                input.totalSteps = totalSteps;
                input.value = value || '';
                input.prompt = prompt;
                input.buttons = [
                    ...(this.steps.length > 1
                        ? [vscode.QuickInputButtons.Back]
                        : []),
                    ...(buttons || []),
                ];
                let validating = validate('');
                disposables.push(
                    input.onDidTriggerButton((item) => {
                        if (item === vscode.QuickInputButtons.Back) {
                            reject(InputFlowAction.back);
                        } else {
                            resolve(<any>item);
                        }
                    }),
                    input.onDidAccept(async () => {
                        const value = input.value;
                        input.enabled = false;
                        input.busy = true;
                        if (!(await validate(value))) {
                            resolve(value);
                        }
                        input.enabled = true;
                        input.busy = false;
                    }),
                    input.onDidChangeValue(async (text) => {
                        const current = validate(text);
                        validating = current;
                        const validationMessage = await current;
                        if (current === validating) {
                            input.validationMessage = validationMessage;
                        }
                    }),
                    input.onDidHide(() => {
                        (async () => {
                            reject(
                                shouldResume && (await shouldResume())
                                    ? InputFlowAction.resume
                                    : InputFlowAction.cancel
                            );
                        })().catch(reject);
                    })
                );
                if (this.current) {
                    this.current.dispose();
                }
                this.current = input;
                this.current.show();
            });
        } finally {
            disposables.forEach((d) => d.dispose());
        }
    }
}

export function deactivate() {}
