import API from '.'

const model = 'config'

class Config extends API {
  constructor () {
    super(model)
  }

  public updateDeviceConfig = async (data: object): Promise<string> => {
    try {
      const result = await fetch(this.endpoint, {
        method: 'POST',
        headers: this.headers,
        body: JSON.stringify(data)
      })
      const response = await result.text()
      return response
    } catch (err) {
      throw err
    }
  }
}

export default new Config()