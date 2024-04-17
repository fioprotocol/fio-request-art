import axios from 'axios';
import config from './config';

interface MintNFTParams {
    contract_chain: string;
    contract_address: string;
    ipfs_upload: boolean;
    meta_data_name: string;
    meta_data_description: string;
    meta_data_external_url: string;
    owner_public_address: string;
    image_url?: string;
}

export const mintNFT = async (params: MintNFTParams) => {
    let fileUrl = params.image_url || '';

    if (params.ipfs_upload && params.image_url) {
        // Fetch the image content
        const imageResponse = await axios.get(params.image_url, { responseType: 'stream' });
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

        fileUrl = uploadImageResponse.data.ipfs_url;
    }

    // 2. Upload metadata to IPFS
    const metadata = {
        name: params.meta_data_name,
        description: params.meta_data_description,
        file_url: fileUrl,
        external_url: params.meta_data_external_url
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
        chain: params.contract_chain,
        contract_address: params.contract_address,
        tokens: [
            {
                mint_to_address: params.owner_public_address,
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