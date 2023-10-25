import axios from 'axios';
import config from './config';

export const generateImage = async (textPrompt: string): Promise<string> => {
        const headers = {
            'Authorization': `Bearer ${config.OPENAI_API_KEY}`,
            'Content-Type': 'application/json',
        };

        const requestBody = {
            prompt: textPrompt,
            n: 1, // Number of images to generate
            size: "512x512", // Image size
        };

        const response = await axios.post(config.DALLE_API_URL, requestBody, { headers: headers });

        if (!response.data || !isValidUrl(response.data.data[0].url)) {
            console.error('Failed to generate image from DALL·E');
            throw new Error('Failed to generate image from DALL·E');
        }

        return response.data.data[0].url;
};
export function isValidUrl(str: string): boolean {
    try {
        new URL(str);
        return true;
    } catch (e) {
        return false;
    }
}
