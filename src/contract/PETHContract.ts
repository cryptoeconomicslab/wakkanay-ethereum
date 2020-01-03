import * as ethers from 'ethers'
import { IERC20Contract } from 'wakkanay/dist/contract'
import { Address, Integer } from 'wakkanay/dist/types'

export class PETHContract implements IERC20Contract {
  public static abi = [
    'function approve(address _spender, uint256 _value)',
    'function wrap(uint256 _amount) payable'
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
      await this.connection.approve(spender.data, amount.data)
    } catch (e) {
      throw new Error(`Invalid call: ${e}`)
    }
  }

  public async wrap(amount: string) {
    try {
      await this.connection.wrap(ethers.utils.parseEther(amount), {
        value: ethers.utils.parseEther(amount)
      })
    } catch (e) {
      throw new Error(`Invalid call: ${e}`)
    }
  }
}
