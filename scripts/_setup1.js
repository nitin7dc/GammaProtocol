const yargs = require('yargs')
const { utils } = require('ethers')
const { createScaledNumber: scaleNum } = require('../test/utils')

const MockERC20 = artifacts.require('MockERC20.sol')
const AddressBook = artifacts.require('AddressBook.sol')
const MockPricer = artifacts.require('MockPricer.sol')

module.exports = async function (callback) {
  try {
    console.log(`Deploying MockPricers: 🍕`)

    const usdcTx = await MockERC20.new('USDC', 'USDC', 6)
    console.log(`Transaction hash: ${usdcTx.transactionHash}`)
    console.log(`USDC => ${usdcTx.address}`)

    const wethTx = await MockERC20.new('WETH', 'WETH', 18)
    console.log(`Transaction hash: ${wethTx.transactionHash}`)
    console.log(`WETH => ${wethTx.address}`)

    const USDC = usdcTx.address
    const WETH = wethTx.address
    const addressB = '0x4F41b941940005aE25D5ecB0F01BaDbc7065E2dD'

    const addressBook = await AddressBook.at(addressB)
    const oracleAddress = await addressBook.getOracle()

    const wethPricer = await MockPricer.new(WETH, oracleAddress)
    await wethPricer.setPrice(utils.parseUnits('1850', 18))

    console.log('prices set.')

    callback()
  } catch (err) {
    callback(err)
  }
}
