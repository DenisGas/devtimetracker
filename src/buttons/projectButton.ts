import { StatusBarButton } from "./StatusBarButton";
import { formatTime } from "../tracker";
import * as nls from "vscode-nls";

const localize = nls.loadMessageBundle();

export function createProjectButton(
  projectName: string | undefined,
  getTotalProjectTime: () => number,
  getTodayProjectTime: () => number
): StatusBarButton {
  const projectButton = new StatusBarButton(
    "devtimetracker.showProjectTime",
    100,
    `$(clock) ${formatTime(getTodayProjectTime())}`,
    () => `$(clock) ${formatTime(getTodayProjectTime())}`,
    () =>
      localize(
        "projectTooltip",
        projectName || "Unknown",
        formatTime(getTodayProjectTime()),
        formatTime(getTotalProjectTime())
      )
  );

  return projectButton;
}
