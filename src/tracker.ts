import * as crypto from "crypto";

export interface ProjectStats {
  [projectId: string]: {
    projectPath: string;
    totalCodingTime: number;
    totalOpenTime: number;
    files: {
      [filePath: string]: {
        openTime: number;
        codingTime: number;
        type: string;
        dailyStats: {
          [date: string]: {
            codingTime: number;
            openTime: number;
          };
        };
      };
    };
    dailyStats: {
      [date: string]: {
        codingTime: number;
        openTime: number;
      };
    };
  };
}

// Получение ID проекта на основе его пути
export function getProjectId(projectPath: string): string {
  return crypto.createHash("sha1").update(projectPath).digest("hex");
}

// Форматирование времени в строку "Xh Ym Zs"
export function formatTime(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  return `${h}h ${m}m ${s}s`;
}

// Получение текущей даты в формате YYYY-MM-DD
export function getCurrentDate(): string {
  return new Date().toISOString().split("T")[0];
}

// Обновление статистики по текущему дню
export function updateDailyStats(
  projectStats: ProjectStats,
  projectId: string,
  filePath: string,
  codingTime: number,
  openTime: number
) {
  const currentDate = getCurrentDate();

  // Обновляем статистику для проекта
  if (!projectStats[projectId].dailyStats[currentDate]) {
    projectStats[projectId].dailyStats[currentDate] = {
      codingTime: 0,
      openTime: 0,
    };
  }
  projectStats[projectId].dailyStats[currentDate].codingTime += codingTime;
  projectStats[projectId].dailyStats[currentDate].openTime += openTime;

  // Обновляем статистику для файла
  if (!projectStats[projectId].files[filePath].dailyStats[currentDate]) {
    projectStats[projectId].files[filePath].dailyStats[currentDate] = {
      codingTime: 0,
      openTime: 0,
    };
  }
  projectStats[projectId].files[filePath].dailyStats[currentDate].codingTime +=
    codingTime;
  projectStats[projectId].files[filePath].dailyStats[currentDate].openTime +=
    openTime;
}
