import { IWallet } from '../interfaces/IWallet'
import { IDepositContract } from '../../contract'
import { DepositContract } from '../../contract/tezos/DepositContract'
import { Address, Bytes } from '../../types/Codables'
import { Balance } from '../../types'
import BigNumber from 'bignumber.js'
import sodiumsumo from 'libsodium-wrappers-sumo'
import {
  ConseilServerInfo,
  CryptoUtils,
  KeyStore,
  TezosConseilClient,
  TezosMessageUtils,
} from 'conseiljs'

export class TezosWallet implements IWallet {
  constructor(
    private tezosWallet: KeyStore,
    private conseilServerinfo: ConseilServerInfo
  ) {}

  public getTezosWallet(): KeyStore {
    return this.tezosWallet
  }

  public getAddress(): Address {
    return Address.from(this.tezosWallet.publicKeyHash)
  }

  /**
   * TODO: support ERC20
   */
  public async getL1Balance(): Promise<Balance> {
    // can't get an account if it has not participated in a transaction yet
    const account = await TezosConseilClient.getAccount(this.conseilServerinfo, this.conseilServerinfo.network, this.getAddress().raw)
    const balance = account[0] ? account[0].balance : 0
    return new Balance(new BigNumber(balance), 6, 'tz')
  }

  /**
   * signMessage signed a hex string message
   * @param message is hex string
   */
  public async signMessage(message: Bytes): Promise<Bytes> {
    const messageBuffer = Buffer.from(message.toHexString())
    const privateKeyBuffer = TezosMessageUtils.writeKeyWithHint(this.tezosWallet.privateKey, 'edsk')
    const signatureBuffer = await CryptoUtils.signDetached(messageBuffer, privateKeyBuffer)
    return Bytes.fromHexString(
      signatureBuffer.toString('hex')
    )
  }

  /**
   * verify signature
   * only support Ed25519 key (tz1)
   */
  public async verifySignature(message: Bytes, signature: Bytes, publicKey: Bytes): Promise<Boolean> {
    const messageBuffer = Buffer.from(message.toHexString())
    const publicKeyBuffer = TezosMessageUtils.writeKeyWithHint(publicKey.intoString(), 'edpk')
    const signatureBuffer = Buffer.from(signature.toHexString().slice(2), 'hex')
    await sodiumsumo.ready
    return sodiumsumo.crypto_sign_verify_detached(
      signatureBuffer,
      messageBuffer,
      publicKeyBuffer
    )
  }

  /**
   * TODO: add implementation
   */
  public getDepositContract(address: Address): IDepositContract {
    return new DepositContract()
  }
}
