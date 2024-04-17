import { getPendingFioRequests } from './app/fioProtocol';
import { rejectFioRequest } from './app/fioProtocol';
import { getFioSdkInstance } from './app/fioProtocol';
import { generateImage } from './app/generateImage';
import { mintNFT } from './app/mintNFT';

export const handler = async () => {
    try {
        const fioSDK = getFioSdkInstance();
        const fioRequests = await getPendingFioRequests(fioSDK);

        for (const request of fioRequests) {
            // Check for valid evm address
            if (/^0x[a-fA-F0-9]{40}$/.test(request.payee_public_address)) {
                if (request.payer_fio_address === 'art@fio' && request.memo && request.memo.length >= 3) {
                    // Generate image
                    const imageURL = await generateImage(request.memo);
                    // Mint NFT with IPFS storage
                    if (imageURL) {
                        const mintResponse = await mintNFT({
                            contract_chain: 'polygon',
                            contract_address: '0x7bfc7492b32e40d7dd9b0a241b5d0ba9ccf1632b',
                            ipfs_upload: true,
                            meta_data_name: `FIO Request Art by ${request.payee_fio_address}`,
                            meta_data_description: request.memo,
                            meta_data_external_url: "https://fio.net/",
                            owner_public_address: request.payee_public_address,
                            image_url: imageURL
                        });
                        console.log(`Request from ${request.payee_fio_address} processed.`);
                    }
                } else if (request.payer_fio_address === 'handle@fio') {
                    // Mint NFT without IPFS storage
                    const mintResponse = await mintNFT({
                        contract_chain: 'polygon',
                        contract_address: '0xab8d7a7f6bbcb9b4fa5ea7f3968998a2049ea4e3',
                        ipfs_upload: false,
                        meta_data_name: `${request.payee_fio_address}`,
                        meta_data_description: `FIO Handle: ${request.payee_fio_address}`,
                        meta_data_external_url: `https://fio.id/${request.payee_fio_address}`,
                        owner_public_address: request.payee_public_address,
                        image_url: `https://metadata.fioprotocol.io/nftimage/${request.payee_fio_address}.svg`
                    });
                    console.log(`Request from ${request.payee_fio_address} processed.`);
                }
            } else {
                console.log(`Invalid evm address`);
            }
            // Reject the fioRequest
            await rejectFioRequest(fioSDK, request.fio_request_id, 1000000000000, '');
        }
    } catch (error) {
        console.error('Error in lambdaHandler:', error);
        throw error;
    }
};