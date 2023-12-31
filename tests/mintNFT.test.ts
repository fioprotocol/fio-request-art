import mintNFT from '../app/mintNFT';
import { ProcessedFioRequest } from '@/fioProtocol';

describe('mintNFT integration test', () => {
    const sampleFioRequestData: ProcessedFioRequest = {
        fio_request_id: 1,
        payee_fio_address: "pawel@edge",
        payee_public_address: "0xB28D93ea0cE0fC2016b4B9548f0951877c22D082",
        memo: "Nice art!"
    };

    const sampleImageURL = "https://upload.wikimedia.org/wikipedia/commons/thumb/b/b6/Felis_catus-cat_on_snow.jpg/269px-Felis_catus-cat_on_snow.jpg";

    it('should mint NFT successfully', async () => {
        const result = await mintNFT(sampleFioRequestData, sampleImageURL);

        // Validate that the result is as expected
        expect(result).toBeTruthy();
    });
});
