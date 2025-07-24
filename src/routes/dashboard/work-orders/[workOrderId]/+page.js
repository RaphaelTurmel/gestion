import { supabase } from '$lib/supabaseClient';
import { error } from '@sveltejs/kit';

export async function load({ params }) {
    const { workOrderId } = params;

    const { data: workOrder, error: woError } = await supabase
        .from('work_orders')
        .select(`*, rvs ( * ), clients ( * )`)
        .eq('id', workOrderId)
        .single();
    
    if (woError) {
        throw error(404, 'Work Order not found');
    }

    const { data: items, error: itemsError } = await supabase
        .from('work_order_items')
        .select('*')
        .eq('work_order_id', workOrderId)
        .order('description');

    return {
        workOrder,
        items: items || []
    };
}