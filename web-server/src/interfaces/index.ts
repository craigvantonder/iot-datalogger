export interface IDevice {
  id: number,
  chipId: number,
  chipModel: string,
  chipRevision: number,
  chipCores: number,
  macAddress: string,
  name: string,
  config: [IConfig],
  telemetry: [ITelemetry]
}

export interface IConfig {
  id?: number,
  readingInterval: string,
  manualReadingInterval: number,
  userLed: boolean,
  device?: IDevice,
  deviceId?: number
}

export interface ITelemetry {
  id?: number,
  timestamp: bigint,
  temperature: number,
  humidity: number,
  heatIndex: number,
  device?: IDevice,
  deviceId?: number,
  chipId?: number
}

export interface ITelemetryFormPayload {
  devices: IDevice[],
  date: {
    // As the index can be dynamic is needs explicit typing
    // https://bobbyhadz.com/blog/typescript-object-with-dynamic-keys
    [key: string]: string | null,
    from: string | null,
    to: string | null
  },
  page: {
    number: number,
    size: number
  }
}

export interface IWebsocketMessage {
  action?: string,
  channel: string,
  message: string | ITelemetry
}