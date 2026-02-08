
import { getTeamMemberConfig } from '../../src/lib/ai-config';
import dotenv from 'dotenv';
dotenv.config();

console.log("Echo config:", getTeamMemberConfig('echo').systemPrompt.substring(0, 50) + "...");
