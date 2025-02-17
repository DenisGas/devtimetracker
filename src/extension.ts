import * as vscode from "vscode";
import { loadStats, saveStats } from "./helper/storage";
import { getProjectId, getCurrentDate } from "./helper/tracker";
import { IProjectStats } from "./interfaces/IProjectStats";
import path from "path";
import { createFileButton } from "./buttons/fileButton";
import { createProjectButton } from "./buttons/projectButton";
import { StatusBarButton } from "./buttons/StatusBarButton";
import Localization from "./helper/localization";

let projectStats: IProjectStats = {};
let currentFile: string | undefined;
let interval: NodeJS.Timeout | undefined;
let projectId: string | undefined;
let projectName: string | undefined;
let lastEditTime: number = Date.now();
let buttons: StatusBarButton[] = [];

export async function activate(context: vscode.ExtensionContext) {
  const localization = new Localization(context);

  await localization.init();

  // vscode.window.showInformationMessage(localization.t("hello"));

  console.log("DevTimeTracker запущен");

  if (vscode.workspace.workspaceFolders) {
    const projectPath = vscode.workspace.workspaceFolders[0].uri.fsPath;
    projectId = getProjectId(projectPath);
    projectName = path.basename(projectPath);
  }

  projectStats = loadStats();

  const projectBtn = createProjectButton(
    localization,
    projectName,
    () => (projectId ? projectStats[projectId]?.totalCodingTime || 0 : 0),
    () =>
      projectId
        ? projectStats[projectId]?.dailyStats[getCurrentDate()]?.codingTime || 0
        : 0
  );

  const fileBtn = createFileButton(
    localization,
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

  buttons = [fileBtn, projectBtn];

  updateButtonVisibility();

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

  vscode.workspace.onDidCloseTextDocument((document) => {
    if (currentFile && document.fileName === currentFile) {
      console.log(`[DevTimeTracker] Закрыт файл: ${currentFile}`);
      stopTrackingFile();
    }
  });

  context.subscriptions.push(...buttons);
}

function updateButtonVisibility() {
  const projectBtn = buttons[1];
  const fileBtn = buttons[0];

  const projectTotalTime = projectId
    ? projectStats[projectId]?.totalCodingTime
    : undefined;

  if (projectTotalTime !== undefined) {
    projectBtn.updateTooltip();
    fileBtn.updateTooltip();
  }

  if (projectId && projectTotalTime !== undefined) {
    projectBtn.show();
    currentFile ? fileBtn.show() : fileBtn.hide();
  } else {
    projectBtn.hide();
    fileBtn.hide();
  }
}

function stopTrackingFile() {
  if (interval) {
    clearInterval(interval);
    interval = undefined;
  }

  currentFile = undefined;
  updateButtonVisibility();
}

function switchFile(newFile: string) {
  if (!projectId) {
    console.log("[DevTimeTracker] projectId не визначений!");
    return;
  }

  console.log(`[DevTimeTracker] Перемикання на файл: ${newFile}`);

  if (currentFile && currentFile !== newFile) {
    stopTrackingFile();
  }

  currentFile = newFile;
  lastEditTime = Date.now();

  console.log(`currentFile ${currentFile}`);

  updateButtonVisibility();

  const currentDate = getCurrentDate();
  const projectPath = vscode.workspace.workspaceFolders?.[0]?.uri.fsPath || "";

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

  buttons.forEach((button) => {
    button.updateTooltip();
  });

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
