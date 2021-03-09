'use strict';

import { ExtensionContext, Uri, window, workspace } from 'vscode';

import * as path from 'path';

export function getPanelTitle(
  uri: Uri,
): string {
  const prefix ='Edit';

  return `${prefix}: ${path.basename(uri.fsPath)}`;
}

export function getWebviewOptions(context: ExtensionContext, uri: Uri) {
  return {
    enableScripts: true,
    retainContextWhenHidden: true,
    localResourceRoots: getLocalResourceRoots(context, uri)
  };
}

export function getDocumentUri(uri?: Uri) {
  const activeEditor = window.activeTextEditor;

  return uri || activeEditor?.document.uri;
}

function getLocalResourceRoots(
  context: ExtensionContext,
  resource: Uri
): Uri[] {

  const baseRoots = [Uri.file(context.extensionPath)];
  const folder = workspace.getWorkspaceFolder(resource);

  if (folder) {
    return baseRoots.concat(folder.uri);
  }

  if (!resource.scheme || resource.scheme === 'file') {
    return baseRoots.concat(Uri.file(path.dirname(resource.fsPath)));
  }

  return baseRoots;
}