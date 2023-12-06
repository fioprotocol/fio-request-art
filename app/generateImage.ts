import axios from 'axios';
import config from './config';

export const generateImage = async (textPrompt: string): Promise<string | null> => {
        const headers = {
            'Authorization': `Bearer ${config.OPENAI_API_KEY}`,
            'Content-Type': 'application/json',
        };

        const requestBody = {
            model: "dall-e-3",
            prompt: textPrompt,
            n: 1, // Number of images to generate
            size: "1024x1024", // Image size
        };

        try {
            const response = await axios.post(config.DALLE_API_URL, requestBody, { headers: headers });

            // Check if the response has valid data and URL
            if (!response.data || !response.data.data || !response.data.data[0].url || !isValidUrl(response.data.data[0].url)) {
                throw new Error('Invalid response data or URL from DALL·E');
            }

            return response.data.data[0].url;
        } catch (error: unknown) {
            if (axios.isAxiosError(error)) {
                // Check for content policy violation error
                if (error.response && error.response.data && error.response.data.error && error.response.data.error.code === 'content_policy_violation') {
                    console.log('Prompt rejected by dall-e');
                    return null; // Specific handling for this error
                }
            }

            // Rethrow the error for other types of errors
            throw error;
        }
};
export function isValidUrl(str: string): boolean {
    try {
        new URL(str);
        return true;
    } catch (e) {
        return false;
    }
}
