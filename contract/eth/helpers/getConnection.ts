import * as ethers from 'ethers'
import { EthWallet } from '../../../wallet/eth/EthWallet'

export function getConnection(
  wallet: EthWallet,
  contractAddress: string,
  abi: string[]
): ethers.Contract {
  const ethersWallet = wallet.getEthersWallet()
  const contract = new ethers.Contract(
    contractAddress,
    abi,
    ethersWallet.provider
  )
  return contract.connect(ethersWallet)
}
