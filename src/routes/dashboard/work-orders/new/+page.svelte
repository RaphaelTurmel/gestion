<script>
    import WorkOrderForm from '../WorkOrderForm.svelte';
    import { supabase } from '$lib/supabaseClient';
    import { goto } from '$app/navigation';
    import { page } from '$app/stores';

    const vinFromUrl = $page.url.searchParams.get('vin');

    async function handleSubmit(event) {
        const { workOrder, items } = event.detail;

        const { data: woResult, error: woError } = await supabase
            .from('work_orders')
            .insert(workOrder)
            .select()
            .single();

        if (woError) {
            alert('Error creating work order: ' + woError.message);
            return;
        }

        if (items.length > 0) {
            const itemsToInsert = items.map(item => ({
                work_order_id: woResult.id,
                description: item.description,
                technician: item.technician,
                notes: item.notes,
                status: item.status
            }));
            const { error: itemsError } = await supabase.from('work_order_items').insert(itemsToInsert);
            if (itemsError) {
                alert('Work order saved, but failed to save tasks: ' + itemsError.message);
            }
        }
        
        goto(`/dashboard/work-orders/${woResult.id}`);
    }
</script>

<div class="p-4">
    <h1 class="text-2xl font-bold mb-4">Create New Work Order</h1>
    <WorkOrderForm 
        workOrderData={{ vin: vinFromUrl }}
        on:submit={handleSubmit} 
    />
</div>