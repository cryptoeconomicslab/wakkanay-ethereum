import { EthWallet } from './eth/EthWallet'
import { EthWalletFactory } from './eth/EthWalletFactory'
export * from './interfaces/IWallet'
export * from './interfaces/IWalletFactory'

// TODO: switch by env
const Wallet = EthWallet
const WalletFactory = EthWalletFactory
export default { Wallet, WalletFactory }
