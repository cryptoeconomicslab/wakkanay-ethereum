import fs from 'fs'
import dotenv from 'dotenv'
dotenv.config()

export class TzEnv {
  public static setEnv() {
    const envConfig = dotenv.parse(fs.readFileSync('.env.test'))
    process.env['NETWORK_NAME'] = envConfig['TEZOS_NETWORK_NAME']
    process.env['RPC_URL'] = envConfig['TEZOS_RPC_URL']
    process.env['API_KEY'] = envConfig['TEZOS_API_KEY']
  }
}
