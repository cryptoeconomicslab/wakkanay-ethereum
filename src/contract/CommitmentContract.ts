import * as ethers from 'ethers'
import { contract } from 'wakkanay'
import { Address, Bytes, BigNumber } from 'wakkanay/dist/types'
import ICommitmentContract = contract.ICommitmentContract
import EventLog from 'wakkanay/dist/events/types/EventLog'
import { KeyValueStore } from 'wakkanay/dist/db'
import EthEventWatcher from '../events'

export class CommitmentContract implements ICommitmentContract {
  private connection: ethers.Contract
  private eventWatcher: EthEventWatcher
  readonly gasLimit: number
  public static abi = [
    'function submitRoot(uint64 blkNumber, bytes32 _root)',
    'function getRoot(uint64 blkNumber) view returns (bytes32)',
    'function currentBlock() view returns (uint256)'
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
    this.gasLimit = 200000
  }

  async submit(blockNumber: BigNumber, root: Bytes) {
    return await this.connection.submitRoot(blockNumber.data.toString(), root, {
      gasLimit: this.gasLimit
    })
  }

  async getCurrentBlock(): Promise<BigNumber> {
    const n: ethers.utils.BigNumber = await this.connection.currentBlock()
    return BigNumber.from(BigInt(n.toString()))
  }

  async getRoot(blockNumber: BigNumber): Promise<Bytes> {
    return await this.connection.getRoot(blockNumber.data.toString())
  }

  subscribeBlockSubmitted(
    handler: (blockNumber: BigNumber, root: Bytes) => void
  ) {
    this.eventWatcher.subscribe('CheckpointFinalized', (log: EventLog) => {
      const [blockNumber, root] = log.values
      handler(BigNumber.from(blockNumber), Bytes.from(root))
    })
    this.eventWatcher.cancel()
    this.eventWatcher.start(() => {
      console.log('event polled')
    })
  }
}
