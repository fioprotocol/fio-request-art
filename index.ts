import { getPendingFioRequests } from './fioProtocol';
import { rejectFioRequest } from './fioProtocol';
import { getFioSdkInstance } from './fioProtocol';
import { generateImage } from './generateImage';
import { mintNFT } from './mintNFT';

export const handler = async () => {
    try {
        const fioSDK = getFioSdkInstance();
        const fioRequests = await getPendingFioRequests(fioSDK);

        for (const request of fioRequests) {
            // Generate image
            const imageURL = await generateImage(request.memo);
            // Mint NFT
            const mintResponse = await mintNFT(request, imageURL);
            // Reject the fioRequest
            await rejectFioRequest(fioSDK, request.fio_request_id, 1000000000000, '');
            console.log(`NFT minted for ${request.payee_fio_address}:`, mintResponse);
        }

    } catch (error) {
        console.error('Error in lambdaHandler:', error);
    }
};

