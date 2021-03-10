import * as vscode from 'vscode';

import { getDocumentUri, getPanelTitle, getWebviewOptions, saveFile } from './helpers';

import { EditingProvider } from './features/editing';

const editingType = 'dmn-modeler.editing';

const COMMANDS = {
  EDIT_CMD: 'extension.dmn-modeler.edit'
};

function createPanel(
  context: vscode.ExtensionContext,
  uri: vscode.Uri,
  provider: EditingProvider
): DmnEditorPanel {
  const editorColumn =
    (vscode.window.activeTextEditor &&
      vscode.window.activeTextEditor.viewColumn) ||
    vscode.ViewColumn.One;

  const panel = vscode.window.createWebviewPanel(
    editingType,
    getPanelTitle(uri),
    editorColumn,
    getWebviewOptions(context, uri)
  );

  panel.webview.html = provider.provideContent(uri, panel.webview);

  return { panel, resource: uri, provider };
}

function refresh(
  editor: DmnEditorPanel
) {
  const {
    resource,
    panel,
    provider
  } = editor;

  panel.webview.html = provider.provideContent(resource, panel.webview);
}

export interface DmnEditorPanel {
  panel: vscode.WebviewPanel;
  resource: vscode.Uri;
  provider: EditingProvider;
}

export function activate(context: vscode.ExtensionContext) {

  const openedPanels: DmnEditorPanel[] = [];
  const editingProvider = new EditingProvider(context);

  const _registerMessageReceiver = (panel: vscode.WebviewPanel, uri: vscode.Uri) => {
    panel.webview.onDidReceiveMessage(
      message => {
        switch (message.command) {
          case 'saveContent':
            return saveFile(uri, message.content);
        }
      },
      undefined,
      context.subscriptions
    );
  };

  const _revealIfAlreadyOpened = (
    uri: vscode.Uri,
    provider: EditingProvider
  ): boolean => {
    const opened = openedPanels.find(panel => {
      const {
        resource,
        provider: panelProvider
      } = panel;

      return resource.fsPath === uri.fsPath && panelProvider === provider;
    });

    if (!opened) { 
      return false; 
    }

    opened.panel.reveal(opened.panel.viewColumn);

    return true;
  };

  const _registerPanel = (
    editorPanel: DmnEditorPanel
  ): void => {
    editorPanel.panel.onDidDispose(() => {
      openedPanels.splice(openedPanels.indexOf(editorPanel), 1);
    });

    editorPanel.panel.onDidChangeViewState(() => {
      refresh(editorPanel);
    });

    _registerMessageReceiver(editorPanel.panel, editorPanel.resource);

    openedPanels.push(editorPanel);
  };
  
  const _registerCommands = (): void => {
    const { 
      EDIT_CMD 
    } = COMMANDS;

    vscode.commands.registerCommand(EDIT_CMD, (uri: vscode.Uri) => {
      const documentUri = getDocumentUri(uri);

      if (documentUri && !_revealIfAlreadyOpened(documentUri, editingProvider)) {
        const panel = createPanel(context, documentUri, editingProvider);

        _registerPanel(panel);

        return panel;
      }
    });  
  };

  const _serializePanel = (
    provider: EditingProvider
  ): void => {
    const viewType = editingType;

    if (vscode.window.registerWebviewPanelSerializer) {
      vscode.window.registerWebviewPanelSerializer(viewType, {
        async deserializeWebviewPanel(panel: vscode.WebviewPanel, state: any) {
          if (!state || !state.resourcePath) {
            return;
          }

          const resource = vscode.Uri.parse(state.resourcePath);

          panel.title = panel.title || getPanelTitle(resource);
          panel.webview.options = getWebviewOptions(context, resource);
          panel.webview.html = provider.provideContent(resource, panel.webview);

          _registerPanel({ panel, resource, provider });
        }
      });
    }
  };

  _registerCommands();
  _serializePanel(editingProvider);
}

// this method is called when your extension is deactivated
export function deactivate() {}
