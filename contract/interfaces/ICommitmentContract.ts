import { Bytes } from '../../types'

export interface ICommitmentContract {
  submit(blockNumber: number, root: Bytes): Promise<void>
}
