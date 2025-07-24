import { supabase } from '$lib/supabaseClient';
import { error } from '@sveltejs/kit';

export async function load() {
    const { data: clients, error: clientError } = await supabase
        .from('clients')
        .select('id, first_name, last_name')
        .order('last_name');

    if (clientError) {
        throw error(500, 'Could not fetch clients for the form.');
    }

    return {
        clients
    };
}