import axios from 'axios';
import { ProcessedFioRequest } from './fioProtocol';
import config from './config';

export const mintNFT = async (fioRequestData: ProcessedFioRequest, imageURL: string) => {

    // Fetch the image content
    const imageResponse = await axios.get(imageURL, { responseType: 'stream' });
    const FormData = require('form-data');
    const formData: any = new FormData();
    formData.append('file', imageResponse.data);

    // 1. Upload the file to IPFS
    const uploadImageResponse = await axios.post(
        `${config.NFTPORT_API_URL}/files`,
        formData,
        {
            headers: {
                ...formData.getHeaders(),
                'Authorization': config.NFTPORT_API_KEY
            }
        }
    );

    if (!uploadImageResponse.data || !uploadImageResponse.data.ipfs_url) {
        console.error('Failed to upload image to IPFS');
        throw new Error('Failed to upload image to IPFS');
    }

    // 2. Upload metadata to IPFS
    const metadata = {
        name: `FIO Request Art by ${fioRequestData.payee_fio_address}`,
        description: fioRequestData.memo,
        file_url: uploadImageResponse.data.ipfs_url,
        external_url: "https://fio.net/"
    };

    const uploadMetadataResponse = await axios.post(
        `${config.NFTPORT_API_URL}/metadata`,
        metadata,
        { headers: { 'Authorization': config.NFTPORT_API_KEY } }
    );

    if (!uploadMetadataResponse.data || !uploadMetadataResponse.data.metadata_uri) {
        console.error('Failed to upload metadata to IPFS');
        throw new Error('Failed to upload metadata to IPFS');
    }

    // 3. Mint the NFT using batch customizable minting
    const mintData = {
        chain: "polygon",
        contract_address: config.NFTPORT_CONTRACT_ADDRESS,
        tokens: [
            {
                mint_to_address: fioRequestData.payee_public_address,
                token_id: Math.floor(Math.random() * 1_000_000_000).toString(), // random 9-digit number
                metadata_uri: uploadMetadataResponse.data.metadata_uri,
                quantity: 1
            }
        ]
    };

    const mintResponse = await axios.post(
        `${config.NFTPORT_API_URL}/mints/customizable/batch`,
        mintData,
        { headers: { 'Authorization': config.NFTPORT_API_KEY } }
    );

    if (!mintResponse.data || mintResponse.data.response !== "OK") {
        console.error('Failed to mint NFT');
        throw new Error('Failed to mint NFT');
    }

    return true;
};

export default mintNFT;
