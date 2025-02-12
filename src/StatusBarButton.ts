import * as vscode from "vscode";

export class StatusBarButton {
  private statusBarItem: vscode.StatusBarItem;
  private updateCallback: () => string;
  private updateTooltipCallback: () => string;
  private lastTooltip: string = "";

  constructor(
    private command: string,
    private priority: number,
    private tooltip: string,
    updateCallback: () => string,
    updateTooltipCallback: () => string
  ) {
    this.statusBarItem = vscode.window.createStatusBarItem(
      vscode.StatusBarAlignment.Left,
      priority
    );
    this.statusBarItem.command = command;
    this.updateCallback = updateCallback;
    this.updateTooltipCallback = updateTooltipCallback;
    this.statusBarItem.tooltip = tooltip;
    this.statusBarItem.text = this.updateCallback();
    this.statusBarItem.show();

    vscode.commands.registerCommand(command, () => {
      vscode.window.showInformationMessage(this.tooltip);
    });

    vscode.window.onDidChangeActiveTextEditor(() => {
      this.updateTooltip();
    });
  }

  update() {
    this.statusBarItem.text = this.updateCallback();
  }

  updateTooltip() {
    const newTooltip = this.updateTooltipCallback();

    this.tooltip = newTooltip;

    if (this.lastTooltip !== newTooltip) {
      this.lastTooltip = newTooltip;
      this.statusBarItem.tooltip = newTooltip;
    }
  }

  dispose() {
    this.statusBarItem.dispose();
  }
}
