import API from '.'
import type { ITelemetry, ITelemetryFormPayload } from '../lib/interfaces'

const model = 'telemetry'

class Telemetry extends API {
  constructor () {
    super(model)
  }

  public page = async (payload: ITelemetryFormPayload): Promise<{ total: number, telemetry: ITelemetry[] }> => {
    try {
      const result = await fetch(this.endpoint, {
        method: 'POST',
        headers: this.headers,
        body: JSON.stringify(payload)
      })
      const { total, telemetry } = <{ total: number, telemetry: ITelemetry[] }>await result.json()
      return { total, telemetry }
    } catch (err) {
      throw err
    }
  }
}

export default new Telemetry()