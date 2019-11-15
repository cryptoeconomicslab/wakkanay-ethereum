import fs from 'fs'
import dotenv from 'dotenv'
dotenv.config()

export class EthEnv {
  public static setEnv() {
    const envConfig = dotenv.parse(fs.readFileSync('.env.test'))
    process.env['RPC_URL'] = envConfig['RPC_URL']
  }
}
