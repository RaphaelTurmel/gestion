import { supabase } from './supabaseClient.js';
import { forestRiverToken } from './stores.js';
import { get } from 'svelte/store';
import { env } from '$env/dynamic/public';

const FUNCTION_NAME = 'forest-river-api';

function decodeJwtPayload(token) {
    try {
        const payloadBase64 = token.split('.')[1];
        const decodedJson = atob(payloadBase64);
        return JSON.parse(decodedJson);
    } catch (e) {
        return null;
    }
}

function isTokenExpired(token) {
    const payload = decodeJwtPayload(token);
    if (!payload || !payload.exp) return true;
    const expirationTimeInSeconds = payload.exp;
    const nowInSeconds = Date.now() / 1000;
    return expirationTimeInSeconds < (nowInSeconds + 60);
}

// This function is now only for getting the FR token string
async function getFrAuthToken() {
    let tokenData = get(forestRiverToken);
    if (tokenData && !isTokenExpired(tokenData.access_token)) {
        return tokenData.access_token;
    }

    console.log("No valid FR token found, fetching a new one...");
    forestRiverToken.set(null);
    
    const { data, error } = await supabase.functions.invoke(FUNCTION_NAME, {
        body: {
            route: 'auth-token',
            userName: env.PUBLIC_FR_USERNAME,
            password: env.PUBLIC_FR_PASSWORD
        }
    });

    if (error) throw new Error(`Forest River Auth Failed: ${error.message}`);
    
    forestRiverToken.set(data);
    return data.access_token;
}

// Generic invoker that handles Supabase auth
async function invokeFunction(bodyPayload) {
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    if (sessionError || !session) {
        throw new Error("User not authenticated with Supabase.");
    }
    
    const headers = {
        'Authorization': `Bearer ${session.access_token}`,
    };

    return await supabase.functions.invoke(FUNCTION_NAME, { headers, body: bodyPayload });
}

export async function searchVinDetails(vin) {
    const dealerId = env.PUBLIC_FR_DEALER_ID;
    const frToken = await getFrAuthToken();
    const { data, error } = await invokeFunction({
        route: 'vin-details',
        dealerId,
        vin,
        frToken
    });
    if (error) throw error;
    if (Array.isArray(data)) return data;
    if (data && typeof data === 'object' && data.VIN) return [data];
    return [];
}

export async function searchClaims(searchTerm) {
    const dealerId = env.PUBLIC_FR_DEALER_ID;
    const frToken = await getFrAuthToken();
    const { data, error } = await invokeFunction({
        route: 'claims/search',
        dealerId,
        searchTerm,
        frToken
    });
    if (error) throw error;
    return data.Results || [];
}

export async function syncLatestClaims() {
    const dealerId = env.PUBLIC_FR_DEALER_ID;
    const frToken = await getFrAuthToken();
    const { data, error } = await invokeFunction({
        route: 'claims/sync',
        dealerId,
        frToken
    });
    if (error) throw error;
    return data;
}