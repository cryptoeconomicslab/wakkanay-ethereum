import * as ethers from 'ethers'
import { contract } from 'wakkanay'
import { Address, Bytes, Integer } from 'wakkanay/dist/types'
import ICommitmentContract = contract.ICommitmentContract
import EventLog from 'wakkanay/dist/events/types/EventLog'
import { KeyValueStore } from 'wakkanay/dist/db'
import EthEventWatcher from '../events'

export class CommitmentContract implements ICommitmentContract {
  private connection: ethers.Contract
  private eventWatcher: EthEventWatcher
  readonly gasLimit: number
  public static abi = ['function submit_root(uint64 blkNumber, bytes32 _root)']
  constructor(
    address: Address,
    eventDb: KeyValueStore,
    provider: ethers.providers.Provider
  ) {
    this.connection = new ethers.Contract(
      address.raw,
      CommitmentContract.abi,
      provider
    )
    this.eventWatcher = new EthEventWatcher({
      endpoint: process.env.MAIN_CHAIN_ENDPOINT as string,
      kvs: eventDb,
      contractAddress: address.raw,
      contractInterface: this.connection.interface
    })
    this.gasLimit = 200000
  }
  async submit(blockNumber: number, root: Bytes) {
    return await this.connection.submit_root(blockNumber, root, {
      gasLimit: this.gasLimit
    })
  }

  subscribeBlockSubmitted(
    handler: (blockNumber: Integer, root: Bytes) => void
  ) {
    this.eventWatcher.subscribe('CheckpointFinalized', (log: EventLog) => {
      const [blockNumber, root] = log.values
      handler(Integer.from(blockNumber), Bytes.from(root))
    })
  }
}
