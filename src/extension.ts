import * as vscode from 'vscode';

export function activate(context: vscode.ExtensionContext) {
	const CONFIGNAME = 'uppercaseHighlighter';

	interface Settings {
		enabled: boolean,
		underlined: boolean,
		bolder: boolean
	};

	let settings: Settings = readSettings();
	let decorationType: vscode.TextEditorDecorationType = createDecoration(settings);

	const command = vscode.commands.registerCommand('uppercase-highlighter.toggle', () => {
		vscode.window.showInformationMessage('[dbg] toggle');
		settings.enabled = !settings.enabled;
		updateSettings();
	});

	context.subscriptions.push(
		vscode.window.onDidChangeActiveTextEditor((editor) => {
			if (editor) {
				highlightCharacters(editor);
			}
		}),
		vscode.window.onDidChangeActiveTextEditor(editor => {
			if (editor) {
				highlightCharacters(editor);
			}
		}),
		vscode.workspace.onDidChangeTextDocument((event) => {
			const editor = vscode.window.activeTextEditor;
			if (editor && event.document === editor.document && settings.enabled) {
				highlightCharacters(editor);
			}
		}),
		vscode.workspace.onDidChangeConfiguration((event) => {
			if (event.affectsConfiguration(CONFIGNAME)) {
				vscode.window.showInformationMessage('[dbg] settings changed');
				processStateChange();
			}
		})
	);

	context.subscriptions.push(command);

	function highlightCharacters(editor: vscode.TextEditor) {
		if (editor) {
			if (settings.enabled) {
				const text = editor.document.getText();
				const decorations: vscode.DecorationOptions[] = [];

				for (let i = 0; i < text.length; i++) {
					if (text[i] === text[i].toUpperCase() && text[i] !== text[i].toLowerCase()) {
						const startPos = editor.document.positionAt(i);
						const endPos = editor.document.positionAt(i + 1);
						const decoration = { range: new vscode.Range(startPos, endPos) };
						decorations.push(decoration);
					}
				}
				editor.setDecorations(decorationType, decorations);
			}
			else {
				editor.setDecorations(decorationType, []); // Clear decorations
			}
		}
	}

	function processStateChange() {
		settings = readSettings();
		decorationType = createDecoration(settings);
		vscode.window.showInformationMessage(`Uppercase Highlighter: ${state()}`);

		const editor = vscode.window.activeTextEditor;
		if (editor) {
			highlightCharacters(editor!);
		}
	}

	function state(): string {
		return settings.enabled ? 'enabled' : 'disabled';
	}

	function createDecoration(settings: Settings) {
		let options: vscode.DecorationRenderOptions = {
			fontWeight: settings.bolder ? 'bolder' : '',
			textDecoration: settings.underlined ? 'underline' : ''
		};

		return vscode.window.createTextEditorDecorationType(options);
	};

	function readSettings(): Settings {
		const config = vscode.workspace.getConfiguration(CONFIGNAME);
		return {
			enabled: config.get<boolean>('enabled', true),
			underlined: config.get<boolean>('underlined', true),
			bolder: config.get<boolean>('bolder', true),
		};
	}

	function updateSettings() {
		const config = vscode.workspace.getConfiguration(CONFIGNAME);
		vscode.window.showInformationMessage(`[dbg] write settings. preparing...`);

		config.update('enabled', settings.enabled, vscode.ConfigurationTarget.Global).then();
	}
}

export function deactivate() { }

