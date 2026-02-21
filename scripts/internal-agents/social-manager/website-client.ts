
import axios from 'axios';
import dotenv from 'dotenv';
import path from 'path';

// Load envs
const envLocalPath = path.resolve(process.cwd(), '.env.local');
dotenv.config({ path: envLocalPath });
dotenv.config();

export async function postToWebsite(content: string): Promise<boolean> {
    const secret = process.env.INTERNAL_AGENT_SECRET;
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const apiEndpoint = `${appUrl.startsWith('http') ? appUrl : `https://${appUrl}`}/api/internal/post-status`;

    if (!secret) {
        console.error("❌ Missing INTERNAL_AGENT_SECRET in .env");
        return false;
    }

    try {
        console.log(`🌐 Posting to website: ${apiEndpoint}...`);
        const response = await axios.post(apiEndpoint, {
            content,
            type: 'status_update',
            timestamp: new Date().toISOString()
        }, {
            headers: {
                'Authorization': `Bearer ${secret}`,
                'Content-Type': 'application/json'
            }
        });

        if (response.data.success) {
            console.log("✅ Successfully posted to website!");
            return true;
        } else {
            console.error("❌ Website API returned error:", response.data.error);
            return false;
        }
    } catch (error: any) {
        console.error("❌ Error posting to website:", error.message || error);
        if (error.response) {
            console.error("Response data:", error.response.data);
        }
        return false;
    }
}
