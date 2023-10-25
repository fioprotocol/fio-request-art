export default {
    // FIO
    FIO_API_URL: process.env.FIO_API_URL || 'https://fiotestnet.blockpane.com/v1/',
    FIO_PRIVATE_KEY: process.env.FIO_PRIVATE_KEY,
    FIO_REQ_LIMIT: process.env.FIO_REQ_LIMIT || 3,

    // Openai
    DALLE_API_URL: process.env.DALLE_API_URL || 'https://api.openai.com/v1/images/generations',
    OPENAI_API_KEY: process.env.OPENAI_API_KEY,

    // Netport
    NFTPORT_API_URL: process.env.NFTPORT_API_URL || 'https://api.nftport.xyz/v0',
    NFTPORT_API_KEY: process.env.NFTPORT_API_KEY,
    NFTPORT_CONTRACT_ADDRESS: process.env.NFTPORT_CONTRACT_ADDRESS
};

