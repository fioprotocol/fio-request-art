export default {
    // FIO
    FIO_API_URL: process.env.FIO_API_URL || 'https://fiotestnet.blockpane.com/v1/',
    FIO_PRIVATE_KEY: process.env.FIO_PRIVATE_KEY,
    FIO_REQ_LIMIT: process.env.FIO_REQ_LIMIT || 2,

    // Openai
    DALLE_API_URL: process.env.DALLE_API_URL || 'https://api.openai.com/v1/images/generations',
    OPENAI_API_KEY: process.env.OPENAI_API_KEY,

    // Web3 and IPFS
    WEB3_PROVIDER_URL: process.env.WEB3_PROVIDER_URL || 'https://polygon-rpc.com',
    INFURA_IPFS_API_URL: 'https://ipfs.infura.io:5001/api/v0',
    INFURA_IPFS_API_KEY: process.env.INFURA_IPFS_API_KEY,
    INFURA_IPFS_API_KEY_SECRET: process.env.INFURA_IPFS_API_KEY_SECRET,
    ART_CONTRACT_ADDRESS: '0x7bfc7492b32e40d7dd9b0a241b5d0ba9ccf1632b',
    HANDLE_CONTRACT_ADDRESS: '0xab8d7a7f6bbcb9b4fa5ea7f3968998a2049ea4e3',
    CONTRACT_PRIVATE_KEY: process.env.CONTRACT_PRIVATE_KEY,
} as const;