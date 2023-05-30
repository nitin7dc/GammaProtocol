const yargs = require('yargs')
const Whitelist = artifacts.require('Whitelist.sol')

module.exports = async function (callback) {
  try {
    const options = yargs
      .usage(
        'Usage: --network <network> --whitelist <whitelist> --underlyingAsset <underlyingAsset> --strikeAsset <strikeAsset> --collateralAsset <collaternalAsset> --isPut <isPut>',
      )
      .option('network', { describe: 'Network name', type: 'string', demandOption: true })
      .option('whitelist', { describe: 'Whitelist contract address', type: 'string', demandOption: true })
      .option('underlyingAsset', { describe: 'underlyingAsset contract address', type: 'string', demandOption: true })
      .option('strikeAsset', { describe: 'strikeAsset contract address', type: 'string', demandOption: true })
      .option('collateralAsset', { describe: 'collateralAsset contract address', type: 'string', demandOption: true })
      .option('isPut', { describe: 'isPut bool flag', type: 'boolean', demandOption: true })
      .option('gasPrice', { describe: 'Gas price in WEI', type: 'string', demandOption: false }).argv

    console.log(`Executing transaction on ${options.network} 🍕`)

    const whitelist = await Whitelist.at(options.whitelist)

    const isCollateralWhitelisted = await whitelist.isWhitelistedCollateral(options.collateralAsset)
    if (!isCollateralWhitelisted) {
      console.log('collateral whitelisting...')
      const tx = await whitelist.whitelistCollateral(options.collateralAsset);
      await tx.wait()
    }
    console.log('collateral whitelisted.')

    await whitelist.whitelistProduct(
      options.underlyingAsset,
      options.strikeAsset,
      options.collateralAsset,
      options.isPut,
    )
    console.log('Done! 🎉')

    callback()
  } catch (err) {
    console.log(err)
    callback(err)
  }
}
