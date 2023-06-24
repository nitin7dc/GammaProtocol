const yargs = require('yargs')
const { utils } = require('ethers')
const { createScaledNumber: scaleNum } = require('../../test/utils')

const MockERC20 = artifacts.require('MockERC20.sol')
const AddressBook = artifacts.require('AddressBook.sol')
const Controller = artifacts.require('Controller.sol')
const Whitelist = artifacts.require('Whitelist.sol')
const Oracle = artifacts.require('Oracle.sol')
const MarginCalculator = artifacts.require('MarginCalculator.sol')

module.exports = async function (callback) {
  try {
    console.log(`Setting up Gamma...`)

    const USDC = '0x2791bca1f2de4661ed88a30c99a7a9449aa84174'
    const WETH = '0x0d500b1d8e8ef31e21c99d1db9a6444d3adf1270'
    const addressB = '0x66aA1cc1d45A3aDbed1E360d369b3dCcEDEC76dc'

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

    // await controller.setNakedCap(weth.address, utils.parseUnits('5000', 18))
    // await controller.setNakedCap(usdc.address, utils.parseUnits('10000000', 6))
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

    // // set product spot shock values
    const calculator = await MarginCalculator.at(await addressBook.getMarginCalculator())

    // // usd collateralised calls
    // await calculator.setSpotShock(
    //   weth.address, // underlying
    //   usdc.address, // strike
    //   usdc.address, // collateral
    //   false, // is put
    //   '0', // _shockValue
    // )
    // // usd collateralised puts
    // await calculator.setSpotShock(
    //   weth.address, // underlying
    //   usdc.address, // strike
    //   usdc.address, // collateral
    //   true, // is put
    //   '600000000000000000000000000', // _shockValue
    // )
    //
    // // eth collateralised calls
    // await calculator.setSpotShock(
    //   weth.address, // underlying
    //   usdc.address, // strike
    //   weth.address, // collateral
    //   false, // is put
    //   '600000000000000000000000000', // productSpotShockValue
    // )

    // set expiry to value values
    // usd collateralised calls
    await calculator.setUpperBoundValues(
      weth.address, // underlying
      usdc.address, // strike
      usdc.address, // collateral
      false, // _isPut
      timeToExpiry,
      expiryToValue,
    )

    // usd collateralised puts
    await calculator.setUpperBoundValues(
      weth.address, // underlying
      usdc.address, // strike
      usdc.address, // collateral
      true, // _isPut
      timeToExpiry,
      expiryToValue,
    )

    // eth collateralised calls
    await calculator.setUpperBoundValues(
      weth.address, // underlying
      usdc.address, // strike
      weth.address, // collateral
      false, // _isPut
      timeToExpiry,
      expiryToValue,
    )

    // const oracleAddress = await addressBook.getOracle()
    // const oracle = await Oracle.at(oracleAddress)
    // await oracle.setStablePrice(usdc.address, '100000000')

    console.log('gamma setup complete')

    callback()
  } catch (err) {
    console.log(err)
    callback(err)
  }
}
