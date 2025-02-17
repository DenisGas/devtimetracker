import * as crypto from "crypto";
import { IProjectStats } from "../interfaces/IProjectStats";

/**
 * Generates a unique ID for a project based on its path using SHA1 hash.
 * @param projectPath The path to the project
 * @returns A unique project ID
 */
export function getProjectId(projectPath: string): string {
  return crypto.createHash("sha1").update(projectPath).digest("hex");
}

/**
 * Converts seconds into hours, minutes, and seconds.
 * @param seconds The time in seconds
 * @returns An array with hours, minutes, and seconds
 */
function formatTimeUnits(seconds: number): [number, number, number] {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secondsLeft = Math.floor(seconds % 60);
  return [hours, minutes, secondsLeft];
}

/**
 * Formats total time (coding or open time) into a readable string (e.g., "1h 30m 15s").
 * @param seconds The time in seconds to format
 * @returns A string representing the total time in hours, minutes, and seconds
 */
export function formatTotalTime(seconds: number): string {
  const [hours, minutes, secondsLeft] = formatTimeUnits(seconds);
  return `${hours}h ${minutes}m ${secondsLeft}s`;
}

/**
 * Formats time (coding or open time) with a shorter format, depending on the time value.
 * If the time is less than 1 hour, it only shows minutes and seconds.
 * @param seconds The time in seconds to format
 * @returns A string representing the time in hours, minutes, and seconds
 */
export function formatTime(seconds: number): string {
  const [hours, minutes, secondsLeft] = formatTimeUnits(seconds);

  if (hours > 0) {
    return `${hours}h ${minutes}m ${secondsLeft}s`;
  } else if (minutes > 0) {
    return `${minutes}m ${secondsLeft}s`;
  } else {
    return `${secondsLeft}s`;
  }
}

/**
 * Returns the current date in the format YYYY-MM-DD.
 * @returns A string representing today's date in YYYY-MM-DD format
 */
export function getCurrentDate(): string {
  return new Date().toISOString().split("T")[0];
}

/**
 * Updates the daily statistics for a project and a specific file.
 * This includes both coding time and open time for the current date.
 *
 * @param projectStats The overall project statistics object
 * @param projectId The ID of the project to update
 * @param filePath The path of the file to update
 * @param codingTime The coding time to add to the daily stats
 * @param openTime The open time to add to the daily stats
 */
export function updateDailyStats(
  projectStats: IProjectStats,
  projectId: string,
  filePath: string,
  codingTime: number,
  openTime: number
) {
  const currentDate = getCurrentDate();

  // Update daily stats for the project
  if (!projectStats[projectId].dailyStats[currentDate]) {
    projectStats[projectId].dailyStats[currentDate] = {
      codingTime: 0,
      openTime: 0,
    };
  }
  projectStats[projectId].dailyStats[currentDate].codingTime += codingTime;
  projectStats[projectId].dailyStats[currentDate].openTime += openTime;

  // Update daily stats for the file
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
