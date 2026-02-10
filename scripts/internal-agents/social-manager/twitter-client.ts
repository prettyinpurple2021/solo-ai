
import { TwitterApi } from 'twitter-api-v2';
import dotenv from 'dotenv';
import path from 'path';

// Load envs
const envLocalPath = path.resolve(process.cwd(), '.env.local');
dotenv.config({ path: envLocalPath });
dotenv.config();

export async function getTwitterClient() {
    const appKey = process.env.TWITTER_APP_KEY;
    const appSecret = process.env.TWITTER_APP_SECRET;
    const accessToken = process.env.TWITTER_ACCESS_TOKEN;
    const accessSecret = process.env.TWITTER_ACCESS_SECRET;

    if (!appKey || !appSecret || !accessToken || !accessSecret) {
        console.error("❌ Missing Twitter API Credentials in .env");
        return null;
    }

    const client = new TwitterApi({
        appKey,
        appSecret,
        accessToken,
        accessSecret,
    });

    return client.readWrite; // Return read-write client
}

export async function postTweet(text: string): Promise<boolean> {
    try {
        const client = await getTwitterClient();
        if (!client) return false;

        const result = await client.v2.tweet(text);
        console.log(`✅ Posted to X! ID: ${result.data.id}`);
        return true;
    } catch (error: any) {
        console.error("❌ Error posting to X:", error);
        return false;
    }
}
