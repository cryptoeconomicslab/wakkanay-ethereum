import { Property } from '../../ovm/types'

export interface IDepositContract {
  deposit(amount: number, initialState: Property): Promise<void>
  finalizeCheckpoint(checkpoint: Property): Promise<void>
  finalizeExit(stateUpdate: Property, depositedRangeId: number): Promise<void>
}
