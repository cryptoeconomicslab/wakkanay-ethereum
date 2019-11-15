import { EthWallet } from './eth/EthWallet'
import { EthWalletFactory } from './eth/EthWalletFactory'
import { TzWallet } from './tz/TzWallet'
import { TzWalletFactory } from './tz/TzWalletFactory'
export * from './interfaces/IWallet'
export * from './interfaces/IWalletFactory'
export * from './eth/EthWallet'
export * from './eth/EthWalletFactory'
export * from './tz/TzWallet'
export * from './tz/TzWalletFactory'

// TODO: switch by env
const Wallet = EthWallet
const WalletFactory = EthWalletFactory
export default { Wallet, WalletFactory }
