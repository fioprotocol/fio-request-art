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
            if (/^0x[a-fA-F0-9]{40}$/.test(request.payee_public_address) && request.memo && request.memo.length >= 3) {
                // Generate image
                const imageURL = await generateImage(request.memo);
                // Mint NFT
                if (imageURL) {
                    const mintResponse = await mintNFT(request, imageURL);
                    console.log(`NFT minted for ${request.payee_fio_address}:`, mintResponse);
                }
            } else console.log(`Invalid evm address or memo`)
            // Reject the fioRequest
            await rejectFioRequest(fioSDK, request.fio_request_id, 1000000000000, '');
        }
    } catch (error) {
        console.error('Error in lambdaHandler:', error);
        throw error;
    }
};

