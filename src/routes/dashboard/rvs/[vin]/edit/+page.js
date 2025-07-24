import { supabase } from '$lib/supabaseClient';
import { error } from '@sveltejs/kit';

export async function load({ params }) {
    const { vin } = params;

    // Fetch both the RV and the full client list in parallel
    const [rvRes, clientsRes] = await Promise.all([
        supabase.from('rvs').select('*').eq('vin', vin).single(),
        supabase.from('clients').select('id, first_name, last_name').order('last_name')
    ]);

    if (rvRes.error) {
        throw error(404, 'RV not found.');
    }

    return {
        rv: rvRes.data,
        clients: clientsRes.data || []
    };
}