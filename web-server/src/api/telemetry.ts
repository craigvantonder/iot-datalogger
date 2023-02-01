import API from './index'
import type { ITelemetry, ITelemetryFormPayload } from '../interfaces'

const model = 'telemetry'

class Telemetry extends API {
  constructor () {
    super(model)
  }

  public page = async (payload: ITelemetryFormPayload): Promise<{ total: number, telemetry: ITelemetry[] }> => {
    try {
      interface query {
        skip?: number,
        take?: number,
        orderBy?: { timestamp: string },
        id?: { in: number[] },
        where?: {
          OR?: { deviceId: number }[],
          AND?: { timestamp: { gte?: number, lte?: number } }[]
        }
      }
      const query = <query>{
        skip: (payload.page.number-1)*payload.page.size,
        take: payload.page.size,
        orderBy: { timestamp: 'desc' }
      }
      if (payload.devices.length > 0) query.where = { OR: payload.devices.map(d=> ({ deviceId: d.id })) }
      if (payload.date.from || payload.date.to) {
        if (typeof query.where === 'undefined') query.where = {}
        query.where.AND = []
        if (payload.date.from) query.where.AND.push({ timestamp: { gte: new Date(payload.date.from).getTime() }})
        if (payload.date.to) query.where.AND.push({ timestamp: { lte: new Date(payload.date.to).getTime() }})
      }
      const telemetry: [ITelemetry] = await this.prisma[this.model].findMany(query)
      delete query.skip
      delete query.take
      delete query.orderBy
      const total = await this.prisma[this.model].count(query)
      return { total, telemetry }
    } catch (err: any) {
      throw err
    }
  }
}

export default new Telemetry()