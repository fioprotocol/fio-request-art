import { handler } from '../index';

async function runLocalTest() {
    console.log('Starting local test...');

    try {
        console.log('Calling handler...');
        await handler();
        console.log('Handler execution completed successfully.');
    } catch (error) {
        console.error('Error occurred during handler execution:', error);
    }
}

runLocalTest();