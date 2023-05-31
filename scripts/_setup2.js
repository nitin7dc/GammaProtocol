const yargs = require('yargs')
const { utils } = require('ethers')
const { createScaledNumber: scaleNum } = require('../test/utils')

const MockERC20 = artifacts.require('MockERC20.sol')
const AddressBook = artifacts.require('AddressBook.sol')
const Controller = artifacts.require('Controller.sol')
const Whitelist = artifacts.require('Whitelist.sol')
const Oracle = artifacts.require('Oracle.sol')
const MarginCalculator = artifacts.require('MarginCalculator.sol')

module.exports = async function (callback) {
  try {
    console.log(`Deploying Setup: 🍕`)

    const USDC = '0x0b80e3f7b9038Cc182b1F647F907eD8DB00aC0Ff'
    const WETH = '0x130C277872F3F03EFF2fEd0C1a03B67D3036FA64'
    const addressB = '0x4F41b941940005aE25D5ecB0F01BaDbc7065E2dD'

    const productSpotShockValue = scaleNum(0.5, 27)
    const day = 60 * 60 * 24
    const timeToExpiry = [day * 7, day * 14, day * 28, day * 42, day * 56, day * 84]
    // array of upper bound value correspond to time to expiry
    const expiryToValue = [
      scaleNum(0.1678, 27),
      scaleNum(0.237, 27),
      scaleNum(0.3326, 27),
      scaleNum(0.4032, 27),
      scaleNum(0.4603, 27),
      scaleNum(0.5, 27),
    ]

    const usdc = await MockERC20.at(USDC)
    const weth = await MockERC20.at(WETH)

    const addressBook = await AddressBook.at(addressB)
    const controllerAddress = await addressBook.getController()

    console.log(`controllerAddress at => ${controllerAddress}`)
    const controller = await Controller.at(controllerAddress)

    await controller.setNakedCap(weth.address, utils.parseUnits('5000', 18))
    await controller.setNakedCap(usdc.address, utils.parseUnits('10000000', 6))
    await controller.refreshConfiguration()

    const whitelistAddress = await addressBook.getWhitelist()
    const whitelist = await Whitelist.at(whitelistAddress)

    await whitelist.whitelistCollateral(weth.address)
    await whitelist.whitelistCollateral(usdc.address)

    // whitelist products
    // normal calls
    await whitelist.whitelistProduct(weth.address, usdc.address, weth.address, false)
    // // normal puts
    await whitelist.whitelistProduct(weth.address, usdc.address, usdc.address, true)
    // // usd collateralised calls
    // await whitelist.whitelistProduct(weth.address, usdc.address, usdc.address, false)
    // // eth collateralised puts
    // await whitelist.whitelistProduct(weth.address, usdc.address, weth.address, true)

    // set product spot shock values
    const calculator = await MarginCalculator.at(await addressBook.getMarginCalculator())
    // usd collateralised calls
    await calculator.setSpotShock(weth.address, usdc.address, usdc.address, false, productSpotShockValue)
    // usd collateralised puts
    await calculator.setSpotShock(weth.address, usdc.address, usdc.address, true, productSpotShockValue)
    // eth collateralised calls
    await calculator.setSpotShock(weth.address, usdc.address, weth.address, false, productSpotShockValue)
    // set expiry to value values
    // usd collateralised calls
    await calculator.setUpperBoundValues(weth.address, usdc.address, usdc.address, false, timeToExpiry, expiryToValue)
    // usd collateralised puts
    await calculator.setUpperBoundValues(weth.address, usdc.address, usdc.address, true, timeToExpiry, expiryToValue)
    // eth collateralised calls
    await calculator.setUpperBoundValues(weth.address, usdc.address, weth.address, false, timeToExpiry, expiryToValue)

    const oracleAddress = await addressBook.getOracle()
    const oracle = await Oracle.at(oracleAddress)
    await oracle.setStablePrice(usdc.address, '100000000')

    console.log('execution complete')

    callback()
  } catch (err) {
    callback(err)
  }
}
