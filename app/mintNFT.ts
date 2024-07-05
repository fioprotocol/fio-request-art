import { Web3, ContractExecutionError } from 'web3';
import axios from 'axios';
import FormData from 'form-data';
import { ethers } from 'ethers';
import config from './config';

interface MintNFTParams {
    contract_address: string;
    ipfs_upload: boolean;
    meta_data_name: string;
    meta_data_description: string;
    meta_data_external_url: string;
    owner_public_address: string;
    image_url?: string;
    unique: boolean;
    payer_fio_address: string;
    fio_handle: string;
}

const ABI = [{"inputs":[{"internalType":"address","name":"account","type":"address"},{"internalType":"uint256","name":"id","type":"uint256"},{"internalType":"uint256","name":"amount","type":"uint256"},{"internalType":"string","name":"tokenUri","type":"string"}],"name":"mintByOwner","outputs":[],"stateMutability":"nonpayable","type":"function"}];

function stringToUint256(str: string): string {
    const hash = ethers.keccak256(ethers.toUtf8Bytes(str));
    return BigInt(hash).toString();
}

export const mintNFT = async (params: MintNFTParams) => {
    if (!config.WEB3_PROVIDER_URL || !config.CONTRACT_PRIVATE_KEY) {
        throw new Error('Missing WEB3_PROVIDER_URL or CONTRACT_PRIVATE_KEY in config');
    }

    const web3 = new Web3(config.WEB3_PROVIDER_URL);
    web3.eth.transactionBlockTimeout = 100;
    const contract = new web3.eth.Contract(ABI, params.contract_address);

    let fileUrl = params.image_url || '';

    if (params.ipfs_upload && params.image_url) {
        // Fetch the image content
        const imageResponse = await axios.get(params.image_url, { responseType: 'arraybuffer' });
        const formData = new FormData();
        formData.append('file', Buffer.from(imageResponse.data), 'image.png');

        // Upload the file to IPFS using Infura
        if (!config.INFURA_IPFS_API_KEY || !config.INFURA_IPFS_API_KEY_SECRET) {
            throw new Error('Missing INFURA_IPFS_API_KEY or INFURA_IPFS_API_KEY_SECRET in config');
        }

        const uploadImageResponse = await axios.post(
            `${config.INFURA_IPFS_API_URL}/add?pin=true`,
            formData,
            {
                headers: {
                    ...formData.getHeaders(),
                    'Authorization': 'Basic ' + Buffer.from(config.INFURA_IPFS_API_KEY + ':' + config.INFURA_IPFS_API_KEY_SECRET).toString('base64')
                }
            }
        );

        if (!uploadImageResponse.data || !uploadImageResponse.data.Hash) {
            console.error('Failed to upload image to IPFS');
            throw new Error('Failed to upload image to IPFS');
        }

        fileUrl = `ipfs://${uploadImageResponse.data.Hash}`;
    }

    // Create metadata
    const metadata = {
        name: params.meta_data_name,
        description: params.meta_data_description,
        image: fileUrl,
        external_url: params.meta_data_external_url
    };

    // Upload metadata to IPFS
    const metadataFormData = new FormData();
    metadataFormData.append('file', Buffer.from(JSON.stringify(metadata)), 'metadata.json');

    const uploadMetadataResponse = await axios.post(
        `${config.INFURA_IPFS_API_URL}/add?pin=true`,
        metadataFormData,
        {
            headers: {
                ...metadataFormData.getHeaders(),
                'Authorization': 'Basic ' + Buffer.from(config.INFURA_IPFS_API_KEY + ':' + config.INFURA_IPFS_API_KEY_SECRET).toString('base64')
            }
        }
    );

    if (!uploadMetadataResponse.data || !uploadMetadataResponse.data.Hash) {
        console.error('Failed to upload metadata to IPFS');
        throw new Error('Failed to upload metadata to IPFS');
    }

    const tokenUri = `ipfs://${uploadMetadataResponse.data.Hash}`;

    // Generate token ID
    let tokenId: string;
    if (params.unique) {
        tokenId = stringToUint256(params.fio_handle);
    } else {
        tokenId = Math.floor(Math.random() * 1_000_000_000).toString(); // random 9-digit number
    }

    // Mint the NFT
    const account = web3.eth.accounts.privateKeyToAccount(config.CONTRACT_PRIVATE_KEY);
    const mintTx = await contract.methods.mintByOwner(params.owner_public_address, tokenId, 1, tokenUri);

    try {
        const gasEstimate = await mintTx.estimateGas({ from: account.address });
        const gasPrice = await web3.eth.getGasPrice();
        const adjustedGasPrice = BigInt(gasPrice) * BigInt(125) / BigInt(100);

        const tx = {
            from: account.address,
            to: params.contract_address,
            data: mintTx.encodeABI(),
            gas: gasEstimate,
            gasPrice: adjustedGasPrice,
        };

        const signedTx = await web3.eth.accounts.signTransaction(tx, config.CONTRACT_PRIVATE_KEY);

        if (!signedTx.rawTransaction) {
            throw new Error('Failed to sign transaction');
        }

        const receipt = await web3.eth.sendSignedTransaction(signedTx.rawTransaction);

        if (!receipt || !receipt.transactionHash) {
            throw new Error('Failed to mint NFT');
        }

        return true;
    } catch (error) {
        if (error instanceof ContractExecutionError) {
            const cause = error.cause as any;
            if (cause && cause.message && cause.message.includes('NFT: token already minted')) {
                console.log(`NFT with ID ${tokenId} already exists.`);
                return false;
            }
        }
        // If it's any other error, re-throw it
        throw error;
    }
};