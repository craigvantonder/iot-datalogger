import API from './index'
import type { IConfig } from '../interfaces'

const model = 'config'

class Config extends API {
  constructor () {
    super(model)
  }

  public updateDeviceConfig = async (deviceId: number, data: object): Promise<number> => {
    try {
      // https://stackoverflow.com/a/73223643/2110294
      const bod = <{ count: number }>await this.prisma[this.model].updateMany({ where: { deviceId }, data })
      const { count: countOfUpdatedRecords } = bod
      return countOfUpdatedRecords
    } catch (err: any) {
      throw err
    }
  }

  public findDeviceConfig = async (deviceId: number): Promise<IConfig> => {
    try {
      const record: IConfig = await this.prisma[this.model].findFirst({ where: { deviceId } })
      return record
    } catch (err: any) {
      throw err
    }
  }
}

export default new Config()