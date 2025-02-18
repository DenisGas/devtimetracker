import * as fs from "fs";
import * as path from "path";
import * as os from "os";

const statsFilePath = path.join(os.homedir(), ".devtimetracker", "stats.json");

console.log(`statsFilePath: ${statsFilePath}`);

export function loadStats(): any {
  try {
    if (fs.existsSync(statsFilePath)) {
      const rawData = fs.readFileSync(statsFilePath, "utf-8");
      return JSON.parse(rawData);
    }
  } catch (error) {
    console.error("Ошибка загрузки статистики:", error);
  }
  return {};
}

export function saveStats(stats: any) {
  try {
    const dir = path.dirname(statsFilePath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(statsFilePath, JSON.stringify(stats, null, 2), "utf-8");
  } catch (error) {
    console.error("Ошибка сохранения статистики:", error);
  }
}
