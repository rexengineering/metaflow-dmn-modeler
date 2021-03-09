'use strict';

import * as vscode from 'vscode';

export class EditingProvider {

    public constructor(private _context: vscode.ExtensionContext) { }

    public provideContent(): string {
        return '';
    }
}