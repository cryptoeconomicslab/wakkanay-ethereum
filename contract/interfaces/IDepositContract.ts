import { Property } from '../../ovm/types'

export interface IDepositContract {
  /**
   * Deposits amount of ETH with initial state
   * @param amount Amount of ETH. Unit is GWEI
   * @param initialState initial state of the range
   */
  deposit(amount: number, initialState: Property): Promise<void>
  /**
   * Finalizes checkpoint claim
   * @param checkpoint Checkpoint property which has been decided true by Adjudicator Contract.
   */
  finalizeCheckpoint(checkpoint: Property): Promise<void>
  /**
   * Finalizes exit claim and withdraw fund
   * @param exit The exit property which has been decided true by Adjudicator Contract.
   * @param depositedRangeId The id of range. We can know depositedRangeId from deposited event and finalizeExited event.
   */
  finalizeExit(exit: Property, depositedRangeId: number): Promise<void>
}
