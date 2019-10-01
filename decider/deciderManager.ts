import { Address } from '../types'
import { IDecider } from './IDecider'

export class DeciderManager {
  private deciders: Map<Address, IDecider>
  constructor() {
    this.deciders = new Map<Address, IDecider>()
  }
  public set_decider(address: Address, decier: IDecider) {
    this.deciders.set(address, decier)
  }
  public get_decider(address: Address) {
    this.deciders.get(address)
  }
}
