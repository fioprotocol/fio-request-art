
import { generateImage } from '../app/generateImage';
import axios from 'axios';

// Mocking the axios module
jest.mock('axios');

describe('generateImage', () => {
    beforeEach(() => {
        // Clear all instances and calls to the constructor and all methods
        jest.clearAllMocks();
    });

    it('should return the correct image URL based on the API response', async () => {
        // Mock any API response just to allow the function to proceed
        const mockApiResponse = {
            data: {
                id: 'some_id',
                created: '2023-10-18T00:00:00Z',
                data: [
                    {
                        url: 'https://example.com/generated_image.jpg'
                    }
                ]
            }
        };

        (axios.post as jest.MockedFunction<any>).mockResolvedValueOnce(mockApiResponse);

        await generateImage('test prompt');

        // Check if axios.post was called
        expect(axios.post).toHaveBeenCalled();
    });
});

