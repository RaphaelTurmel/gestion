import { supabase } from '$lib/supabaseClient';
import { error } from '@sveltejs/kit';

export async function load({ params }) {
    const { vin } = params;

    const [rvRes, workOrdersRes, inspectionsRes] = await Promise.all([
        supabase.from('rvs').select(`*, clients ( * )`).eq('vin', vin).single(),
        supabase.from('work_orders').select('*').eq('vin', vin).order('created_date', { ascending: false }),
        // THE CRITICAL FIX: Ensure nested data is fetched correctly
        supabase.from('inspections').select(`*, inspection_items ( * )`).eq('vin', vin).order('date', { ascending: false })
    ]);

    if (rvRes.error || !rvRes.data) {
        throw error(404, 'RV not found');
    }

    return {
        rv: rvRes.data,
        workOrders: workOrdersRes.data || [],
        inspections: inspectionsRes.data || []
    };
}