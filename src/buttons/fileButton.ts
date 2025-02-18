import * as vscode from "vscode";
import { StatusBarButton } from "./StatusBarButton";
import { formatTime, formatTotalTime } from "../helper/tracker";
import path from "path";
import Localization from "../helper/localization";

/**
 * Creates a status bar button to display file time tracking information.
 *
 * @param localization - Localization object
 * @param getTotalFileTime - Function to get total time for the file
 * @param getTodayFileTime - Function to get today's time for the file
 * @returns StatusBarButton - The created button for the status bar
 */
export function createFileButton(
  localization: Localization,
  getTotalFileTime: () => number,
  getTodayFileTime: () => number
): StatusBarButton {
  const fileButton = new StatusBarButton(
    localization,
    "devtimetracker.showFileTime",
    99,
    `$(file-code) ${formatTime(getTodayFileTime())}`,
    () => `$(file-code) ${formatTime(getTodayFileTime())}`,
    () => {
      const fileName = vscode.window.activeTextEditor?.document.fileName;
      const baseFileName = fileName ? path.basename(fileName) : "Unknown";

      return localization.t(
        "fileTooltip",
        baseFileName,
        formatTotalTime(getTodayFileTime()),
        formatTotalTime(getTotalFileTime())
      );
    }
  );

  return fileButton;
}
