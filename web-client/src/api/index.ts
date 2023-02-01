export default class API {
  private model = ''
  protected endpoint = ''
  protected headers = {
    'Content-Type': 'application/json',
  }

  constructor(model: string) {
    this.model = model
    this.endpoint = `${import.meta.env.VITE_API_LOCATION}/api/${model}`
  }

  protected handleError = async (result: object) => {
    try {
    } catch (err) {
      throw err
    }
  }
}