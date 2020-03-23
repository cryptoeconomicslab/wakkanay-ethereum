import * as ethers from 'ethers'
import { IERC20DetailedContract } from '@cryptoeconomicslab/contract'
import { Address, Integer } from '@cryptoeconomicslab/primitives'

export class ERC20Contract implements IERC20DetailedContract {
  public static abi = [
    'function approve(address _spender, uint256 _value)',
    'function decimals() view returns (uint8)'
  ]

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

  /**
   * decimals method returns decimal value of this token.
   * @returns return Integer object of decimal value
   */
  public async decimals(): Promise<Integer> {
    try {
      return Integer.from(await this.connection.decimals())
    } catch (e) {
      throw new Error(`Invalid call: ${e}. This ERC20 doesn't have decimals.`)
    }
  }
}
