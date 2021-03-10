'use strict';

export class DmnModelerBuilder {
    contents: string;
    resources: any;

    public constructor(contents: string, resources: any) {
      this.contents = contents;
      this.resources = resources;
    }

    private removeNewLines(contents: string): string {
      return contents.replace(/'/g, '"').replace(/(\r\n|\n|\r)/gm, ' ');
    }

    public buildModelerView(): string {
      this.contents = this.removeNewLines(this.contents);

      const head = `<!DOCTYPE html>
        <html>
          <head>
            <meta charset="UTF-8" />

            <title>DMN Modeler</title>

            <!-- modeler distro -->
            <script src="${this.resources.modelerDistro}"></script>

            <!-- required modeler styles -->
            <link rel="stylesheet" href="${this.resources.diagramStyles}">
            <link rel="stylesheet" href="${this.resources.decisionControlStyles}">
            <link rel="stylesheet" href="${this.resources.decisionTableStyles}">
            <link rel="stylesheet" href="${this.resources.drdStyles}">
            <link rel="stylesheet" href="${this.resources.literalExpressionStyles}">
            <link rel="stylesheet" href="${this.resources.sharedStyles}">
            <link rel="stylesheet" href="${this.resources.dmnFont}">

            <link rel="stylesheet" href="${this.resources.modelerStyles}">

            <style>
              /*
              * Will be otherwise overridden by VSCode default styles
              */
              .djs-context-pad,
              .djs-popup {
                color: black;
              }
              .dmn-js-parent {
                color: black;
              }
            </style>
          </head>`;

      const body = `
      <body>
        <div class="content">
          <div id="canvas"></div>
        </div>

        <div class="buttons">
          <div class="spinner"></div>
        </div>

        <script>

          const vscode = acquireVsCodeApi();

          // (1) persist web view state
          vscode.setState({ resourcePath: '${this.resources.resourceUri}'});

          // (2) react on messages from outside
          window.addEventListener('message', (event) => {
            const message = event.data;

            switch(message) {
              case 'saveFile': saveChanges(); break;
            }
          })

          // (3) bootstrap modeler instance
          const dmnModeler = new DmnJS({
            container: '#canvas'
          });
          
          /**
           * Open diagram in our modeler instance.
           *
           * @param {String} dmnXML diagram to display
           */
          async function openDiagram(dmnXML) {

            // import diagram
            await dmnModeler.importXML(dmnXML, (err) => {
              if (!err) {
                keyboardBindings();
              }
              else {
                const {
                  warnings
                } = err;
  
                return console.error('could not import DMN 1.3 diagram', err, warnings);
              }
            });
          }

          async function saveDiagramChanges() {            
            await dmnModeler.saveXML({ format: true }, (err, xml) => {
              if(err) {
                return console.error('could not save DMN 1.3 diagram', err);
              }

              return vscode.postMessage({
                command: 'saveContent',
                content: xml
              });
            });
          }

          async function saveChanges() {
            const spinner = document.getElementsByClassName("spinner")[0];
            spinner.classList.add("active");

            await saveDiagramChanges()

            setTimeout(function() {
              spinner.classList.remove("active");
            }, 1000);
          }

          function keyboardBindings() {
            const viewer = dmnModeler.getActiveViewer();
            const keyboard = viewer.get('keyboard');
            keyboard.bind(document);

            keyboard.addListener(function(context) {

              const event = context.keyEvent;

              if (keyboard.isKey(['s', 'S'], event) && keyboard.isCmd(event)) {
                saveChanges();
                return true;
              }
            });
          }

          // open diagram
          openDiagram('${this.contents}');
        </script>
      </body>
      `;

      const tail = ['</html>'].join('\n');

      return head + body + tail;
    }
}