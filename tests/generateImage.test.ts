import { generateImage } from '../app/generateImage';

describe('generateImage integration test', () => {
    it('should return the correct image URL based on the actual API response', async () => {
        const imageUrl = await generateImage('cat testing computer software');
        console.log(imageUrl)
        expect(imageUrl).toMatch(/^https:\/\//);
    });
});