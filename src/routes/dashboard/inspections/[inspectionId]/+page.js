import { supabase } from '$lib/supabaseClient';
import { error } from '@sveltejs/kit';

export async function load({ params }) {
    const { inspectionId } = params;

    const { data: inspection, error: inspError } = await supabase
        .from('inspections')
        .select(`*, rvs ( * )`)
        .eq('id', inspectionId)
        .single();
    
    if (inspError) {
        throw error(404, 'Inspection not found');
    }

    const { data: items, error: itemsError } = await supabase
        .from('inspection_items')
        .select('*')
        .eq('inspection_id', inspectionId)
        .order('defect_description');

    return {
        inspection,
        items: items || []
    };
}