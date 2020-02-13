import * as ethers from 'ethers'
import { IERC20Contract } from '@cryptoeconomicslab/contract'
import { Address, Integer } from '@cryptoeconomicslab/primitives'

export class PETHContract implements IERC20Contract {
  public static abi = [
    'function approve(address _spender, uint256 _value)',
    'function wrap(uint256 _amount) payable',
    'function unwrap(uint256 _amount)'
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
}
