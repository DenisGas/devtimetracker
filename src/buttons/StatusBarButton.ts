import * as vscode from "vscode";
import Localization from "../helper/localization";

/**
 * Represents a button in the VS Code status bar that can display dynamic information.
 *
 * The `StatusBarButton` class creates a button in the status bar that can display custom text and tooltips.
 * The text and tooltip can be dynamically updated based on the provided callback functions.
 * Additionally, the button can be shown, hidden, and disposed of as needed.
 */
export class StatusBarButton {
  private statusBarItem: vscode.StatusBarItem;
  private updateCallback: () => string;
  private updateTooltipCallback: () => string;
  private lastTooltip: string = "";

  /**
   * Creates an instance of a StatusBarButton.
   *
   * @param localization - Localization object used for translating strings.
   * @param command - The command that will be triggered when the button is clicked.
   * @param priority - The priority for the button in the status bar.
   * @param tooltip - The initial tooltip text for the button.
   * @param updateCallback - Callback function that returns the updated text for the button.
   * @param updateTooltipCallback - Callback function that returns the updated tooltip text.
   */
  constructor(
    private localization: Localization, // Localization object
    private command: string, // Command to trigger on click
    private priority: number, // Priority for the status bar
    private tooltip: string, // Initial tooltip text
    updateCallback: () => string, // Callback to update the button text
    updateTooltipCallback: () => string // Callback to update the tooltip
  ) {
    // Create the status bar item and set its properties
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

    // Register the command to show information message
    vscode.commands.registerCommand(command, () => {
      vscode.window.showInformationMessage(this.tooltip);
    });

    // Update tooltip when the active text editor changes
    vscode.window.onDidChangeActiveTextEditor(() => {
      this.updateTooltip();
    });
  }

  // Updates the button text
  update() {
    this.statusBarItem.text = this.updateCallback();
  }

  // Updates the tooltip text
  updateTooltip() {
    const newTooltip = this.updateTooltipCallback();

    this.tooltip = newTooltip;

    if (this.lastTooltip !== newTooltip) {
      this.lastTooltip = newTooltip;
      this.statusBarItem.tooltip = newTooltip;
    }
  }

  // Hides the status bar item
  hide() {
    this.statusBarItem.hide();
  }

  // Shows the status bar item
  show() {
    this.statusBarItem.show();
  }

  // Disposes of the status bar item
  dispose() {
    this.statusBarItem.dispose();
  }
}
