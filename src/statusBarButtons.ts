import * as vscode from "vscode";
import { formatTime } from "./tracker";
import { StatusBarButton } from "./StatusBarButton";

export function createStatusBarButtons(
  projectName: string | undefined,
  getTotalProjectTime: () => number,
  getTodayProjectTime: () => number,
  getTotalFileTime: () => number,
  getTodayFileTime: () => number
): StatusBarButton[] {
  const projectTimeButton = new StatusBarButton(
    "devtimetracker.showProjectTime",
    100,
    `$(clock) ${formatTime(getTodayProjectTime())}`,
    () => `$(clock) ${formatTime(getTodayProjectTime())}`,
    () =>
      `📂 Проект: ${projectName || "Неизвестно"}\n` +
      `🟢 Сегодня: ${formatTime(getTodayProjectTime())}\n` +
      `🕒 Всего: ${formatTime(getTotalProjectTime())}`
  );

  const fileTimeButton = new StatusBarButton(
    "devtimetracker.showFileTime",
    99,
    `$(file-code) ${formatTime(getTodayFileTime())}`,
    () => `$(file-code) ${formatTime(getTodayFileTime())}`,
    () =>
      `📄 Файл: ${
        vscode.window.activeTextEditor?.document.fileName || "Неизвестно"
      }\n` +
      `🟢 Сегодня: ${formatTime(getTodayFileTime())}\n` +
      `🕒 Всего: ${formatTime(getTotalFileTime())}`
  );

  return [projectTimeButton, fileTimeButton];
}
