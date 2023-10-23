
import {getFioSdkInstance, getPendingFioRequests} from '@/fioProtocol';
const fioSDK = getFioSdkInstance();

describe('getPendingFioRequests', () => {
    it('should fetch pending FIO requests and return in expected format', async () => {
        const result = await getPendingFioRequests(fioSDK);

        // Check if result is an array
        expect(Array.isArray(result)).toBe(true);

        // If there are results, validate the structure
        if (result.length > 0) {
            const request = result[0];
            expect(request).toHaveProperty('fio_request_id');
            expect(request).toHaveProperty('payee_fio_address');
            expect(request).toHaveProperty('payee_public_address');
            expect(request).toHaveProperty('chain_code');
            expect(request).toHaveProperty('memo');
        }
    });
});
