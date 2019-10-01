import { Address } from '../types/types'
import { DeciderInterface } from './deciderInterface'

export class DeciderManager {
  private deciders: Map<Address, DeciderInterface>
  constructor() {
    this.deciders = new Map<Address, DeciderInterface>()
  }
  public set_decider(address: Address, decier: DeciderInterface) {
    this.deciders.set(address, decier)
  }
  public get_decider(address: Address) {
    this.deciders.get(address)
  }
}
