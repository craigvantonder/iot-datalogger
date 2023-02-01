import API from './index'
import type { IDevice } from '../interfaces'

const model = 'device'

class Device extends API {
  constructor () {
    super(model)
  }

  public findByChipId = async (chipId: number): Promise<any> => {
    try {
      const record: any = await this.prisma[this.model].findFirst({ where: { chipId } })
      return record
    } catch (err: any) {
      throw err
    }
  }

  public register = async (payload: IDevice): Promise<any> => {
    try {
      const record: any = await this.prisma[this.model].create({
        data : {
          ...payload,
          name: 'New Device',
          config: {
            create: {
              readingInterval: 'sec',
              manualReadingInterval: 30,
              userLed: false
            }
          }
        },
        include: {
          config: true, // Include in the returned object
        },
      })
      return record
    } catch (err: any) {
      throw err
    }
  }
}

export default new Device()