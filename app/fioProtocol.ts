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
    memo: string;
}

export const getPendingFioRequests = async (fioSdk: InstanceType<typeof FIOSDK>): Promise<ProcessedFioRequest[]> => {
    try {
        const result = await fioSdk.genericAction('getPendingFioRequests', {limit: config.FIO_REQ_LIMIT, offset: 0})
        const requests = result.requests;
        return requests.map((request: any) => ({
            fio_request_id: request.fio_request_id,
            payee_fio_address: request.payee_fio_address,
            payee_public_address: request.content.payee_public_address,
            memo: request.content.memo
        }));
    } catch (error) {
        if (error instanceof Error && error.message.includes("Error 404")) {
            console.log("No pending FIO requests found.");
            return [];
        }
        throw error;  // If it's not a 404 error, re-throw
    }
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
    if (!result || !result.status || result.status !== 'request_rejected') {
        console.error(`Failed to reject FIO request with ID: ${fioRequestId}. Unexpected result:`, result);
        throw new Error('Failed to reject FIO request due to unexpected result.');
    }
}
