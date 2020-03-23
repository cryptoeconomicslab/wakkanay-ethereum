import * as ethers from 'ethers'
import { IERC20DetailedContract } from '@cryptoeconomicslab/contract'
import { Address, Integer } from '@cryptoeconomicslab/primitives'

export class PETHContract implements IERC20DetailedContract {
  public static abi = [
    'function approve(address _spender, uint256 _value)',
    'function wrap(uint256 _amount) payable',
    'function unwrap(uint256 _amount)',
    'function decimals() view returns (uint8)'
  ]

  private connection: ethers.Contract

  constructor(readonly address: Address, signer: ethers.Signer) {
    this.connection = new ethers.Contract(
      address.data,
      PETHContract.abi,
      signer
    )
  }

  public async approve(spender: Address, amount: Integer) {
    try {
      await this.connection.wrap(ethers.utils.parseEther(String(amount.data)), {
        value: ethers.utils.parseEther(String(amount.data))
      })
      await this.connection.approve(spender.data, amount.data)
    } catch (e) {
      await this.connection.unwrap(ethers.utils.parseEther(String(amount.data)))
      throw new Error(`Invalid call: ${e}`)
    }
  }

  /**
   * decimals method returns decimal value of PlasmaETH token.
   * @returns return Integer object of decimal value. It returns 18.
   */
  public async decimals(): Promise<Integer> {
    try {
      return Integer.from(await this.connection.decimals())
    } catch (e) {
      throw new Error(
        `Invalid call: ${e}. This PETHContract doesn't have decimals.`
      )
    }
  }
}
