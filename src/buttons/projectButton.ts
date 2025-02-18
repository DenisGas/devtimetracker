import { StatusBarButton } from "./StatusBarButton";
import { formatTime, formatTotalTime } from "../helper/tracker";
import Localization from "../helper/localization";

/**
 * Creates a status bar button to display project time tracking information.
 *
 * @param localization - Localization object
 * @param projectName - The name of the project
 * @param getTotalProjectTime - Function to get total project time
 * @param getTodayProjectTime - Function to get today's project time
 * @returns StatusBarButton - The created button for the status bar
 */
export function createProjectButton(
  localization: Localization,
  projectName: string | undefined,
  getTotalProjectTime: () => number,
  getTodayProjectTime: () => number
): StatusBarButton {
  const projectButton = new StatusBarButton(
    localization,
    "devtimetracker.showProjectTime",
    100,
    `$(project) ${formatTime(getTodayProjectTime())}`,
    () => `$(project) ${formatTime(getTodayProjectTime())}`,
    () => {
      return localization.t(
        "projectTooltip",
        projectName,
        formatTotalTime(getTodayProjectTime()),
        formatTotalTime(getTotalProjectTime())
      );
    }
  );

  return projectButton;
}
