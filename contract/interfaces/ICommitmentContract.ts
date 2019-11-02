import { Bytes } from '../../types/Codables'

export interface ICommitmentContract {
  submit(blockNumber: number, root: Bytes): Promise<void>
}
