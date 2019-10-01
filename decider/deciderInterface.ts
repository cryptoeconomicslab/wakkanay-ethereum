import { Bytes, Decision } from '../types/types'

export interface DeciderInterface {
  decide(inputs: Bytes[]): Promise<Decision>
}
