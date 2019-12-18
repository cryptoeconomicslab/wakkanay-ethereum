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
  public static abi = ['function submit_root(uint64 blkNumber, bytes32 _root)']
  constructor(address: Address, eventDb: KeyValueStore, signer: ethers.Signer) {
    this.connection = new ethers.Contract(
      address.data,
      CommitmentContract.abi,
      signer
    )
    this.eventWatcher = new EthEventWatcher({
      endpoint: process.env.MAIN_CHAIN_ENDPOINT as string,
      kvs: eventDb,
      contractAddress: address.data,
      contractInterface: this.connection.interface
    })
    this.gasLimit = 200000
  }
  async submit(blockNumber: BigNumber, root: Bytes) {
    return await this.connection.submit_root(blockNumber, root, {
      gasLimit: this.gasLimit
    })
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
