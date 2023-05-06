import { config } from '@/config';

const voicesOfInterest = [
    'Rachel',
];

interface VoicesResponse {
    voices: [{
        voice_id: string,
        name: string,
    }]
}
interface SettingsResponse {
    stability: number,
    similarity_boost: number,
}

interface VoiceCache {
    [name: string]: {
        voiceId: string,
        stability: number,
        similarityBoost: number,
    }
}

const voices: VoiceCache = {};
let cacheInitialized = false;

export async function textToSpeech(text: string, voice: string, stability: number | undefined = undefined, similarity_boost: number | undefined = undefined): Promise<Buffer> {
    if (!cacheInitialized) {
        const response = await fetch(`https://api.elevenlabs.io/v1/voices`, {
            method: 'GET',
            headers: {
                'Accept': 'application/json',
                'xi-api-key': config.elevenlabs_api_key,
            },
        });
        const voicesResponse = await response.json() as VoicesResponse;
        for (const voice of voicesResponse.voices) {
            if (voicesOfInterest.includes(voice.name)) {
                const response = await fetch(`https://api.elevenlabs.io/v1/voices/${voice.voice_id}/settings`, {
                    method: 'GET',
                    headers: {
                        'Accept': 'application/json',
                        'xi-api-key': config.elevenlabs_api_key,
                    },
                });
                const settingsResponse = await response.json() as SettingsResponse;
                voices[voice.name] = {
                    voiceId: voice.voice_id,
                    stability: settingsResponse.stability,
                    similarityBoost: settingsResponse.similarity_boost,
                }
            }
        }
        cacheInitialized = true;
    }

    const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voices[voice].voiceId}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'audio/mpeg',
            'xi-api-key': config.elevenlabs_api_key,
        },
        body: JSON.stringify({
            text,
            voice_settings: {
                stability: stability || voices[voice].stability,
                similarity_boost: similarity_boost || voices[voice].similarityBoost,
            }
        }),
    });
    if (response.status == 200) {
        return Buffer.from(await response.arrayBuffer());
    }
    if (response.status == 500) {
        const responseJson = await response.json();
        throw new Error(responseJson.error);
    }
    throw new Error(response.statusText);
}