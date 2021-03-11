# rexflow-dmn-modeler README

Display and edit DMN diagrams in VS Code using [bpmn.io](https://bpmn.io/) tools.

## Features

* Open DMN 1.3 (`.dmn`) in a Modeler to make changes to your diagrams
  * From the editor toolbar
  * Via the command palette ("Open DMN Modeler")
  * Via keyboard shortcut (`CTRL/CMD + SHIFT + V`)
* Save changes to your local file

## How to get it

Install the `.vsix` package using the following command.

```sh
$ code --install-extension ./rexflow-dmn-modeler-[VERSION].vsix
```

## Development Setup

First step, clone this project to your local machine.

```sh
$ git clone https://bitbucket.org/rexdev/rexflow-dmn-modeler/
$ cd ./rexflow-dmn-modeler
$ npm install
$ npm run compile
$ code .
```

Press `F5` to load and debug the extension in a new VS Code instance.