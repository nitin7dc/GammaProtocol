const Oracle = artifacts.require('Oracle.sol')

module.exports = async function (callback) {
  try {
    console.log('setup expiry prices in pricers');
    const oracleAddress = '0xD11D98Fe2Be0871E45B459Af22f7dd9FC8c6004d'
    const expiry = '1688112000'
    const oracle = await Oracle.at(oracleAddress)

    // console.log('setting pricers in oracle...');
    const USDC = '0x2791bca1f2de4661ed88a30c99a7a9449aa84174'
    const WETH = '0x0d500b1d8e8ef31e21c99d1db9a6444d3adf1270'
    const usdcPricer = '0x042e4c83546a3F9971df5fE99f3f8c0dba0B8E87'
    const wethPricer = '0x601cdcC58A69F0cC474395F4d9f7921D5510A7B5'

    // await oracle.setAssetPricer(USDC, "0x042e4c83546a3F9971df5fE99f3f8c0dba0B8E87");
    // await oracle.setAssetPricer(WETH, "0x601cdcC58A69F0cC474395F4d9f7921D5510A7B5");
    // console.log('pricers set in oracle');
    // const pricer = await oracle.getPricer(WETH)
    // console.log('pricer', pricer)

    const expiryUSDC = await oracle.getExpiryPrice(USDC, expiry)
    const expiryWETH = await oracle.getExpiryPrice(WETH, expiry)
    console.log('expiryUSDC', expiryUSDC[0].toString(), expiryUSDC[1])
    console.log('expiryWETH', expiryWETH[0].toString(), expiryWETH[1])
    // console.log(await oracle.isDisputePeriodOver(USDC, expiry))
    // console.log(await oracle.isDisputePeriodOver(WETH, expiry))

    // const locking = await oracle.getPricerLockingPeriod(wethPricer)
    // console.log('locking', locking.toString())
    //
    // const dispute = await oracle.getPricerDisputePeriod(wethPricer)
    // console.log('dispute', dispute.toString())

    callback()
  } catch (err) {
    console.log(err)
    callback(err)
  }
}
