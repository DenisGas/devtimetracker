import * as vscode from "vscode";
import { loadStats, saveStats } from "./storage";
import {
  getProjectId,
  formatTime,
  ProjectStats,
  getCurrentDate,
} from "./tracker";
import path from "path";
import { createStatusBarButtons } from "./statusBarButtons";
import { StatusBarButton } from "./StatusBarButton";

let projectStats: ProjectStats = {};
let currentFile: string | undefined;
let interval: NodeJS.Timeout | undefined;
let projectId: string | undefined;
let projectName: string | undefined;
let lastEditTime: number = Date.now();
let buttons: StatusBarButton[] = [];

export function activate(context: vscode.ExtensionContext) {
  console.log("DevTimeTracker запущен");

  if (vscode.workspace.workspaceFolders) {
    const projectPath = vscode.workspace.workspaceFolders[0].uri.fsPath;
    projectId = getProjectId(projectPath);
    projectName = path.basename(projectPath);
  }

  projectStats = loadStats();

  buttons = createStatusBarButtons(
    projectName,
    () => (projectId ? projectStats[projectId]?.totalCodingTime || 0 : 0),
    () =>
      projectId
        ? projectStats[projectId]?.dailyStats[getCurrentDate()]?.codingTime || 0
        : 0,
    () =>
      projectId && currentFile
        ? projectStats[projectId]?.files[currentFile]?.codingTime || 0
        : 0,
    () =>
      projectId && currentFile
        ? projectStats[projectId]?.files[currentFile]?.dailyStats[
            getCurrentDate()
          ]?.codingTime || 0
        : 0
  );

  vscode.window.onDidChangeActiveTextEditor((editor) => {
    if (editor && editor.document) {
      switchFile(editor.document.fileName);
    }
  });

  vscode.workspace.onDidChangeTextDocument((event) => {
    if (currentFile && event.document.fileName === currentFile) {
      lastEditTime = Date.now();
    }
  });

  if (vscode.window.activeTextEditor) {
    switchFile(vscode.window.activeTextEditor.document.fileName);
  }

  context.subscriptions.push(...buttons);
}

function switchFile(newFile: string) {
  if (!projectId) {
    console.log("[DevTimeTracker] projectId не визначений!");
    return;
  }

  console.log(`[DevTimeTracker] Перемикання на файл: ${newFile}`);

  if (currentFile) {
    clearInterval(interval);
    interval = undefined;
  }

  currentFile = newFile;
  lastEditTime = Date.now();
  const currentDate = getCurrentDate();
  const projectPath = vscode.workspace.workspaceFolders?.[0]?.uri.fsPath || "";

  // ✅ **Переконуємось, що проект має всі необхідні дані**
  if (!projectStats[projectId]) {
    console.log(`[DevTimeTracker] Створюємо запис для проєкту ${projectId}`);
    projectStats[projectId] = {
      projectPath,
      totalCodingTime: 0,
      totalOpenTime: 0,
      files: {},
      dailyStats: {},
    };
  }

  const project = projectStats[projectId]!;

  if (!project.dailyStats) {
    project.dailyStats = {};
  }

  if (!project.dailyStats[currentDate]) {
    project.dailyStats[currentDate] = { codingTime: 0, openTime: 0 };
  }

  if (!project.files[currentFile]) {
    console.log(`[DevTimeTracker] Створюємо запис для файлу ${currentFile}`);
    project.files[currentFile] = {
      openTime: 0,
      codingTime: 0,
      type: path.extname(currentFile),
      dailyStats: {},
    };
  }

  if (!project.files[currentFile].dailyStats) {
    project.files[currentFile].dailyStats = {};
  }

  if (!project.files[currentFile].dailyStats[currentDate]) {
    project.files[currentFile].dailyStats[currentDate] = {
      codingTime: 0,
      openTime: 0,
    };
  }

  console.log(`[DevTimeTracker] Запускаємо таймер для ${currentFile}`);

  let lastTooltipUpdate: number = Date.now();

  interval = setInterval(() => {
    if (!currentFile) {
      return;
    }

    const fileStats = project.files[currentFile]!;
    fileStats.openTime += 1;
    fileStats.dailyStats[currentDate].openTime += 1;
    project.totalOpenTime += 1;
    project.dailyStats[currentDate].openTime += 1;

    const now = Date.now();
    const diff = now - lastEditTime;

    if (diff < 10_000) {
      fileStats.codingTime += 1;
      fileStats.dailyStats[currentDate].codingTime += 1;
      project.totalCodingTime += 1;
      project.dailyStats[currentDate].codingTime += 1;
    }

    buttons.forEach((button) => {
      button.update();
    });

    if (now - lastTooltipUpdate >= 5000) {
      buttons.forEach((button) => {
        button.updateTooltip();
      });
      lastTooltipUpdate = now;
    }
  }, 1000);
}

export function deactivate() {
  clearInterval(interval);
  saveStats(projectStats);
  console.log("DevTimeTracker выключен");
}
