require('ts-node/register')
require('dotenv').config()

const HDWalletProvider = require('@truffle/hdwallet-provider')

module.exports = {
  networks: {
    development: {
      host: '127.0.0.1',
      port: 8545,
      network_id: '*',
    },
    mainnet: {
      provider: () => new HDWalletProvider(process.env.MNEMONIC, process.env.RPC_URL),
      network_id: 1,
      chain_id: 1,
      confirmations: 2,
      timeoutBlocks: 50,
      skipDryRun: false,
      gasPrice: 25000000000,
    },
    polygonZKEVMTestnet: {
      provider: () =>
        new HDWalletProvider({
          privateKeys: [process.env.PRIVATE_KEY],
          providerOrUrl: 'https://rpc.public.zkevm-test.net',
        }),
      network_id: 1442,
      chainId: 1442,
      verify: {
        apiUrl: 'https://api-testnet-zkevm.polygonscan.com/api',
        apiKey: process.env.ETHERSCAN_API,
        explorerUrl: 'https://testnet-zkevm.polygonscan.com/',
      },
    },
    polygonZKEVM: {
      provider: () =>
        new HDWalletProvider({
          privateKeys: [process.env.PRIVATE_KEY],
          providerOrUrl: 'https://zkevm-rpc.com',
        }),
      network_id: 1101,
      chain_id: 1101,
      verify: {
        apiUrl: 'https://api-zkevm.polygonscan.com/api',
        apiKey: process.env.ETHERSCAN_API,
        explorerUrl: 'https://zkevm.polygonscan.com',
      },
    },
    custom: {
      provider: () =>
        new HDWalletProvider({
          privateKeys: [process.env.PRIVATE_KEY],
          providerOrUrl: 'http://127.0.0.1:8545',
        }),
      network_id: 1337,
      chain_id: 1337,
      gas: 8000000,
      gasPrice: 250000000000,
      skipDryRun: true,
    },
  },

  mocha: {
    reporter: 'eth-gas-reporter',
    reporterOptions: {
      currency: 'USD',
      artifactType: 'truffle-v5',
      coinmarketcap: process.env.COINMARKETCAP_API,
      excludeContracts: ['Migrations'],
      showTimeSpent: true,
    },
  },

  plugins: ['solidity-coverage', 'truffle-contract-size', 'truffle-plugin-verify'],

  api_keys: {
    etherscan: process.env.ETHERSCAN_API,
  },

  compilers: {
    solc: {
      version: '0.6.10',
      settings: {
        optimizer: {
          enabled: true,
          runs: 200,
        },
      },
    },
  },
}
