import * as vscode from 'vscode';

const COMMANDS = {
  EDIT_CMD: 'extension.dmn-modeler.edit'
};

export function activate(context: vscode.ExtensionContext) {
  
  const _registerCommands = (): void => {
    const { 
      EDIT_CMD 
    } = COMMANDS;

    vscode.commands.registerCommand(EDIT_CMD, (uri: vscode.Uri) => {
      vscode.window.showInformationMessage('editor will be here');
    });  

  };

  _registerCommands();
}

// this method is called when your extension is deactivated
export function deactivate() {}
