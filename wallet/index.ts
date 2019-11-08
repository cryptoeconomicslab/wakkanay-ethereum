import { EthWallet } from './eth/EthWallet'
import { EthWalletFactory } from './eth/EthWalletFactory'
export * from './interfaces/IWallet'
export * from './interfaces/IWalletFactory'
export * from './eth/EthWallet'
export * from './eth/EthWalletFactory'

// TODO: switch by env
const Wallet = EthWallet
const WalletFactory = EthWalletFactory
export default { Wallet, WalletFactory }
