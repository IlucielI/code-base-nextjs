export interface SystemMetadata {
  version: string;
  gitHash: string;
  startedAt: Date;
  appName?: string;
  nodeEnv?: string;
}

export interface ISystemRepository {
  getSystemMetadata(): SystemMetadata;
  getStartTime(): Date;
}
