import * as ethers from 'ethers'
import { IERC20Contract } from '@cryptoeconomicslab/contract'
import { Address, Integer } from '@cryptoeconomicslab/primitives'

export class ERC20Contract implements IERC20Contract {
  public static abi = ['function approve(address _spender, uint256 _value)']

  private connection: ethers.Contract

  constructor(readonly address: Address, signer: ethers.Signer) {
    this.connection = new ethers.Contract(
      address.data,
      ERC20Contract.abi,
      signer
    )
  }

  public async approve(spender: Address, amount: Integer) {
    try {
      await this.connection.approve(spender.data, amount.data)
    } catch (e) {
      throw new Error(`Invalid call: ${e}`)
    }
  }
}
