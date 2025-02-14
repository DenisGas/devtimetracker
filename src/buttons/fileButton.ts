import { StatusBarButton } from "./StatusBarButton";
import { formatTime } from "../tracker";
import * as nls from "vscode-nls";
import * as vscode from "vscode";
import * as path from "path";

const localize = nls.loadMessageBundle();

export function createFileButton(
  getTotalFileTime: () => number,
  getTodayFileTime: () => number
): StatusBarButton {
  const fileButton = new StatusBarButton(
    "devtimetracker.showFileTime",
    99,
    `$(file-code) ${formatTime(getTodayFileTime())}`,
    () => `$(file-code) ${formatTime(getTodayFileTime())}`,
    () => {
      const fileName = vscode.window.activeTextEditor?.document.fileName;
      const baseFileName = fileName ? path.basename(fileName) : "Unknown";
      return localize(
        "fileTooltip",
        baseFileName,
        formatTime(getTodayFileTime()),
        formatTime(getTotalFileTime())
      );
    }
  );

  return fileButton;
}
