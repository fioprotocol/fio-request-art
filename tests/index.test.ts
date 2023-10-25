import { handler } from "../index";  // Adjust the path

describe('handler integration test', () => {
    it('should execute the handler without errors', async () => {
        // Execute the handler
        await expect(handler()).resolves.toBeUndefined();
    });
});