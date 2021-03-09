'use strict';

import * as vscode from 'vscode';
import * as path from 'path';

import { DmnModelerBuilder } from './dmnModelerBuilder';

const fs = require('fs');

export class EditingProvider {

    public constructor(private _context: vscode.ExtensionContext) { }

    private getUri(webview: vscode.Webview, ...p: string[]): vscode.Uri {
        const fileUri = vscode.Uri.file(path.join(this._context.extensionPath, ...p));

        return webview.asWebviewUri(fileUri);
    }

    public provideContent(localResource: vscode.Uri, webview: vscode.Webview): string {
        const localDocumentPath = localResource.fsPath;

        const contents = fs.readFileSync(localDocumentPath, { encoding: 'utf8' });

        const builder = new DmnModelerBuilder(contents, {
            modelerDistro: this.getUri(webview, 'node_modules', 'dmn-js', 'dist', 'dmn-modeler.development.js'),
            diagramStyles: this.getUri(webview, 'node_modules', 'dmn-js', 'dist', 'assets', 'diagram-js.css'),
            dmnFont: this.getUri(webview, 'node_modules', 'dmn-js', 'dist', 'assets', 'dmn-font', 'css', 'dmn.css'),
            modelerStyles: this.getUri(webview, 'out', 'assets', 'modeler.css'),
            resourceUri: localResource
        });

        return builder.buildModelerView();
    }
}