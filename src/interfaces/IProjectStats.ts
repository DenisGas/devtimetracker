// Interface representing project statistics

export interface IProjectStats {
  [projectId: string]: {
    projectPath: string; // Path to the project
    totalCodingTime: number; // Total coding time for the project
    totalOpenTime: number; // Total time the project was open
    files: {
      [filePath: string]: {
        openTime: number; // Total open time for the file
        codingTime: number; // Total coding time for the file
        type: string; // File type (e.g., js, ts)
        dailyStats: {
          [date: string]: {
            codingTime: number; // Coding time for a given date
            openTime: number; // Open time for a given date
          };
        };
      };
    };
    dailyStats: {
      [date: string]: {
        codingTime: number; // Coding time for a given date
        openTime: number; // Open time for a given date
      };
    };
  };
}
