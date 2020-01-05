import * as ethers from 'ethers'
import { BigNumber, Integer, Address, Bytes, Range } from 'wakkanay/dist/types'
import { Property } from 'wakkanay/dist/ovm/types'
import { KeyValueStore } from 'wakkanay/dist/db'
import { contract } from 'wakkanay'
import IDepositContract = contract.IDepositContract
import EthEventWatcher from '../events'
import EventLog from 'wakkanay/dist/events/types/EventLog'

export class DepositContract implements IDepositContract {
  private eventWatcher: EthEventWatcher
  private connection: ethers.Contract
  readonly gasLimit: number

  public static abi = [
    'event CheckpointFinalized(bytes32 checkpointId, tuple(tuple(uint256, uint256), tuple(address, bytes[])) checkpoint)',
    'event ExitFinalized(bytes32 exitId)',
    'function deposit(uint256 _amount, tuple(address, bytes[]) _initialState)',
    'function finalizeCheckpoint(tuple(address, bytes[]) _checkpoint)',
    'function finalizeExit(tuple(address, bytes[]) _exit, uint256 _depositedRangeId)'
  ]
  constructor(
    readonly address: Address,
    eventDb: KeyValueStore,
    signer: ethers.Signer
  ) {
    this.connection = new ethers.Contract(
      address.data,
      DepositContract.abi,
      signer
    )
    this.gasLimit = 200000
    this.eventWatcher = new EthEventWatcher({
      provider: this.connection.provider,
      kvs: eventDb,
      contractAddress: address.data,
      contractInterface: this.connection.interface
    })
  }
  async deposit(amount: Integer, initialState: Property): Promise<void> {
    return await this.connection.deposit(
      amount.data,
      [initialState.deciderAddress.data, initialState.inputs],
      {
        gasLimit: this.gasLimit
      }
    )
  }
  async finalizeCheckpoint(checkpoint: Property): Promise<void> {
    // TODO: fix
    return await this.connection.deposit(checkpoint, {
      gasLimit: this.gasLimit
    })
  }
  async finalizeExit(exit: Property, depositedRangeId: Integer): Promise<void> {
    // TODO: fix
    return await this.connection.deposit(exit, depositedRangeId, {
      gasLimit: this.gasLimit
    })
  }

  subscribeCheckpointFinalized(
    handler: (checkpointId: Bytes, checkpoint: [Range, Property]) => void
  ) {
    this.eventWatcher.subscribe('CheckpointFinalized', (log: EventLog) => {
      const checkpointId = log.values[0]
      const checkpoint = log.values[1]
      const stateUpdate = new Property(
        Address.from(checkpoint[1][0]),
        checkpoint[1][1].map(Bytes.fromHexString)
      )
      const subrange = new Range(
        BigNumber.fromString(checkpoint[0][0].toString()),
        BigNumber.fromString(checkpoint[0][1].toString())
      )

      handler(Bytes.fromHexString(checkpointId), [subrange, stateUpdate])
    })
    this.eventWatcher.cancel()
    this.eventWatcher.start(() => {
      console.log('event polled')
    })
  }

  subscribeExitFinalized(handler: (exitId: Bytes) => void) {
    this.eventWatcher.subscribe('ExitFinalized', (log: EventLog) => {
      const [exitId] = log.values
      handler(Bytes.fromHexString(exitId))
    })
    this.eventWatcher.cancel()
    this.eventWatcher.start(() => {
      console.log('event polled')
    })
  }
}
