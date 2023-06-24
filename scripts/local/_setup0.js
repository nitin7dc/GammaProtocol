const { utils } = require('ethers')
const MockERC20 = artifacts.require('MockERC20.sol')
const AddressBook = artifacts.require('AddressBook.sol')
const MockPricer = artifacts.require('MockPricer.sol')
const Oracle = artifacts.require('Oracle.sol')
const Controller = artifacts.require('Controller.sol')

module.exports = async function (callback) {
  try {
    /****************************************************************************************************
     * Mock ERC20
     ****************************************************************************************************/
    // console.log(`Deploying Mock ERC20s...`)
    // const usdcTx = await MockERC20.new('USDC', 'USDC', 6)
    // console.log(`USDC => ${usdcTx.address}`)
    // const wethTx = await MockERC20.new('WETH', 'WETH', 18)
    // console.log(`WETH => ${wethTx.address}`)

    /****************************************************************************************************
     * Mock Pricers
     ****************************************************************************************************/

    console.log('Deploying Mock Pricers...')

    const usdc = ''
    const weth = ''
    const addressB = ''

    const addressBook = await AddressBook.at(addressB)
    const oracleAddress = await addressBook.getOracle()
    const oracle = await Oracle.at(oracleAddress)

    const wethPricer = await MockPricer.new(weth, oracleAddress)
    await wethPricer.setPrice(utils.parseUnits('1850', 18))
    await oracle.setAssetPricer(weth, wethPricer.address)
    console.log('weth pricer', wethPricer.address)

    const usdcPricer = await MockPricer.new(usdc, oracleAddress)
    await usdcPricer.setPrice(utils.parseUnits('1', 6))
    await oracle.setAssetPricer(usdc, usdcPricer.address)
    console.log('usdc pricer', usdcPricer.address)

    callback()
  } catch (err) {
    callback(err)
  }
}
