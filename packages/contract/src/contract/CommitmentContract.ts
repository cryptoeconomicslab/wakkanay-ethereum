import * as ethers from 'ethers'
import { Address, Bytes, BigNumber } from '@cryptoeconomicslab/primitives'
import { EventLog, ICommitmentContract } from '@cryptoeconomicslab/contract'
import { KeyValueStore } from '@cryptoeconomicslab/db'
import EthEventWatcher from '../events'
import JSBI from 'jsbi'

export class CommitmentContract implements ICommitmentContract {
  private connection: ethers.Contract
  private eventWatcher: EthEventWatcher
  readonly gasLimit: number
  public static abi = [
    'function submitRoot(uint64 blkNumber, bytes32 _root)',
    'function blocks(uint256 blkNumber) view returns (bytes32)',
    'function currentBlock() view returns (uint256)',
    'event BlockSubmitted(uint64 blockNumber, bytes32 root)'
  ]
  constructor(address: Address, eventDb: KeyValueStore, signer: ethers.Signer) {
    this.connection = new ethers.Contract(
      address.data,
      CommitmentContract.abi,
      signer
    )
    this.eventWatcher = new EthEventWatcher({
      provider: this.connection.provider,
      kvs: eventDb,
      contractAddress: address.data,
      contractInterface: this.connection.interface
    })
    this.gasLimit = 400000
  }

  async submit(blockNumber: BigNumber, root: Bytes) {
    return await this.connection.submitRoot(blockNumber.data.toString(), root, {
      gasLimit: this.gasLimit
    })
  }

  async getCurrentBlock(): Promise<BigNumber> {
    const n: ethers.utils.BigNumber = await this.connection.currentBlock()
    return BigNumber.from(JSBI.BigInt(n.toString()))
  }

  async getRoot(blockNumber: BigNumber): Promise<Bytes> {
    return await this.connection.blocks(blockNumber.data.toString())
  }

  subscribeBlockSubmitted(
    handler: (blockNumber: BigNumber, root: Bytes) => void
  ) {
    this.eventWatcher.subscribe('BlockSubmitted', (log: EventLog) => {
      const blockNumber = log.values[0]
      const root = log.values[1]
      handler(
        BigNumber.fromString(blockNumber.toString()),
        Bytes.fromHexString(root)
      )
    })
    this.eventWatcher.cancel()
    this.eventWatcher.start(() => {
      console.log('event polled')
    })
  }
}
