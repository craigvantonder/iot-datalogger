// NB: this must be called before the client so as to load the environement variable that defines the database
// If it is not loaded, the app will fail to start on Windows machines
import '../lib/env-loader'
import { PrismaClient } from '@prisma/client'
// JSON.stringify?/parse? cannot handle BigInt values, convert them to a string
import '../lib/patchBigIntToJSON'

export default class API {
  constructor(model: string) {
    this.model = model
    this.prisma = this.getClient()
  }

  protected model: any = null

  protected instantiateClient = () => {
    try {
      this.prisma = new PrismaClient()
    } catch (err: any) {
      throw err
    }
  }

  public prisma?: any = null

  public getClient = () => {
    try {
      if (!this.prisma) this.instantiateClient()
      return this.prisma
    } catch (err: any) {
      throw err
    }
  }

  // NB: The following methods are shared with all child classes

  public count = async (query: any): Promise<number> => {
    try {
      const total: number = await this.prisma[this.model].count(query)
      return total
    } catch (err: any) {
      throw err
    }
  }

  public find = async (query: any): Promise<any[]> => {
    try {
      const records: any[] = await this.prisma[this.model].findMany(query)
      return records
    } catch (err: any) {
      throw err
    }
  }

  public findAll = async (): Promise<any[]> => {
    try {
      const records: any[] = await this.prisma[this.model].findMany()
      return records
    } catch (err: any) {
      throw err
    }
  }

  public findOne = async (id: number): Promise<any> => {
    try {
      const record: any = await this.prisma[this.model].findFirst({ where: { id } })
      return record
    } catch (err: any) {
      throw err
    }
  }

  public create = async (data: object): Promise<any> => {
    try {
      const record: any = await this.prisma[this.model].create({ data })
      return record
    } catch (err: any) {
      throw err
    }
  }

  public update = async (id: number, data: object): Promise<any> => {
    try {
      const record: any = await this.prisma[this.model].update({ where: { id }, data })
      return record
    } catch (err: any) {
      throw err
    }
  }
}