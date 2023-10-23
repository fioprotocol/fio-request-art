import config from './config';
const { FIOSDK } = require('@fioprotocol/fiosdk');
const fetch = require('node-fetch');
export function getFioSdkInstance() {
    const fetchJson = async (uri: string, opts = {}) => {
        return fetch(uri, opts);
    }
    const apiNode = config.FIO_API_URL;
    const privateKey = config.FIO_PRIVATE_KEY;
    const publicKey = FIOSDK.derivedPublicKey(privateKey).publicKey;
    return new FIOSDK(privateKey, publicKey, apiNode, fetchJson);
}

export interface ProcessedFioRequest {
    fio_request_id: number;
    payee_fio_address: string;
    payee_public_address: string;
    chain_code: string;
    memo: string;
}

export const getPendingFioRequests = async (fioSdk: InstanceType<typeof FIOSDK>): Promise<ProcessedFioRequest[]> => {
        const result = await fioSdk.genericAction('getPendingFioRequests', {limit: 100, offset: 0});
        const requests = result.requests;
        return requests.map((request: any) => ({
            fio_request_id: request.fio_request_id,
            payee_fio_address: request.payee_fio_address,
            payee_public_address: request.payee_token_public_address,
            chain_code: request.chain_code,
            memo: request.memo
        }));
};

export const rejectFioRequest = async (
    fioSdk: InstanceType<typeof FIOSDK>,
    fioRequestId: number,
    maxFee: number,
    technologyProviderId: string
): Promise<void> => {
    const result = await fioSdk.genericAction('rejectFundsRequest', {
        fioRequestId,
        maxFee,
        technologyProviderId
    });
    if (!result || !result.status || result.status !== 'OK') {
        console.error(`Failed to reject FIO request with ID: ${fioRequestId}. Unexpected result:`, result);
        throw new Error('Failed to reject FIO request due to unexpected result.');
    }
}
