import { IWallet } from '../interfaces/IWallet'
import { IDepositContract } from '../../contract'
import { DepositContract } from '../../contract/eth/DepositContract'
import * as ethers from 'ethers'
import { arrayify, joinSignature, parseUnits, SigningKey } from 'ethers/utils'
import BigNumber from 'bignumber.js'
import { Address, Bytes } from '../../types/Codables'
import { Balance } from '../../types'

const ERC20abi = [
  'function balanceOf(address tokenOwner) view returns (uint)',
  'function symbol() view returns (string)',
  'function decimals() view returns (uint)'
]

export class EthWallet implements IWallet {
  private ethersWallet: ethers.Wallet
  private signingKey: SigningKey

  constructor(ethersWallet: ethers.Wallet) {
    this.ethersWallet = ethersWallet
    this.signingKey = new SigningKey(this.ethersWallet.privateKey)
  }

  public getEthersWallet(): ethers.Wallet {
    return this.ethersWallet
  }

  public getAddress(): Address {
    return Address.from(this.signingKey.address)
  }

  public async getL1Balance(tokenAddress?: Address): Promise<Balance> {
    let value: BigNumber, decimals: number, symbol: string
    if (tokenAddress) {
      const contract = new ethers.Contract(tokenAddress.raw, ERC20abi, this.ethersWallet.provider)
      const ERC20 = contract.connect(this.ethersWallet)
      const balanceRes = await ERC20.balanceOf(this.getAddress().raw)
      value = new BigNumber(balanceRes.toString())
      decimals = Number(await ERC20.decimals())
      symbol = await ERC20.symbol()
    } else {
      const balanceRes = await this.ethersWallet.getBalance()
      const balanceGwei = parseUnits(balanceRes.toString(), 'gwei')
      value = new BigNumber(balanceGwei.toString())
      decimals = 9
      symbol = 'gwei'
    }
    return new Balance(value, decimals, symbol)
  }

  /**
   * signMessage signed a hex string message
   * @param message is hex string
   */
  public async signMessage(message: Bytes): Promise<Bytes> {
    return Bytes.fromHexString(
      joinSignature(this.signingKey.signDigest(arrayify(message.toHexString())))
    )
  }

  /**
   * verify signature
   * secp256k1 doesn't need a public key to verify the signature
   */
  public async verifySignature(message: Bytes, signature: Bytes): Promise<Boolean> {
    const recoveredAddress = this.recoverAddress(message, signature)
    return (recoveredAddress.raw.toLocaleLowerCase() === this.ethersWallet.address.toLocaleLowerCase())
  }

  public getDepositContract(address: Address): IDepositContract {
    return new DepositContract(this.getConnection(address, DepositContract.abi))
  }

  /**
   * Get contract instance which connecting by this wallet.
   * @param wallet
   * @param contractAddress
   * @param abi
   */
  private getConnection(contractAddress: Address, abi: string[]) {
    const ethersWallet = this.ethersWallet
    const contract = new ethers.Contract(
      contractAddress.data,
      abi,
      ethersWallet.provider
    )
    return contract.connect(ethersWallet)
  }

  /**
   * recoverAddress
   */
  private recoverAddress(message: Bytes, signatureBytes: Bytes): Address {
    const signature = ethers.utils.splitSignature(signatureBytes.toHexString())
    const recoverAddress = ethers.utils.recoverAddress(
      message.toHexString(),
      signature
    )
    return Address.from(recoverAddress)
  }
}
