import API from '.'
import type { IDevice, IConfig } from '../lib/interfaces'

const model = 'device'

class Device extends API {
  constructor () {
    super(model)
  }

  public find = async (): Promise<IDevice[]> => {
    try {
      const result = await fetch(this.endpoint, {
        method: 'GET',
        headers: this.headers
      })
      const { devices } = await result.json()
      return devices
    } catch (err) {
      throw err
    }
  }

  public update = async (data: IDevice): Promise<IDevice> => {
    try {
      const result = await fetch(this.endpoint, {
        method: 'POST',
        headers: this.headers,
        body: JSON.stringify(data)
      })
      const { device } = await result.json()
      return device
    } catch (err) {
      throw err
    }
  }

  public config = async (deviceId: number): Promise<IConfig> => {
    try {
      const result = await fetch(this.endpoint+'/config', {
        method: 'POST',
        headers: this.headers,
        body: JSON.stringify({ deviceId })
      })
      const { id, deviceId: did, ...config } = await result.json()
      return config
    } catch (err) {
      throw err
    }
  }
}

export default new Device()