<script>
    import { onMount } from 'svelte';
    import { page } from '$app/stores';
    import { supabase } from '$lib/supabaseClient';
    import { goto } from '$app/navigation';
    import WorkOrderForm from '../../WorkOrderForm.svelte';

    let workOrder = null;
    let items = [];
    let loading = true;
    const workOrderId = $page.params.workOrderId;
    
    onMount(async () => {
        const { data: woData, error } = await supabase
            .from('work_orders')
            .select('*')
            .eq('id', workOrderId)
            .single();
            
        if (woData) {
            workOrder = woData;
            const { data: itemData } = await supabase
                .from('work_order_items')
                .select('*')
                .eq('work_order_id', workOrderId);
            if (itemData) items = itemData;
        } else {
            console.error(error);
        }
        loading = false;
    });

    async function handleSubmit(event) {
        const { workOrder: updatedWorkOrder, items: updatedItems } = event.detail;
        
        const { error: woError } = await supabase
            .from('work_orders')
            .update({
                title: updatedWorkOrder.title,
                client_id: updatedWorkOrder.client_id
            })
            .eq('id', workOrderId);
            
        if (woError) {
            alert('Error updating work order: ' + woError.message);
            return;
        }

        const { error: deleteError } = await supabase
            .from('work_order_items')
            .delete()
            .eq('work_order_id', workOrderId);

        if (deleteError) {
            alert('Error clearing old tasks: ' + deleteError.message);
            return;
        }
        
        if (updatedItems.length > 0) {
            const itemsToInsert = updatedItems.map(item => ({
                work_order_id: workOrderId,
                description: item.description,
                technician: item.technician,
                notes: item.notes,
                status: item.status
            }));
            const { error: insertError } = await supabase
                .from('work_order_items')
                .insert(itemsToInsert);
            if (insertError) {
                alert('Error saving new tasks: ' + insertError.message);
                return;
            }
        }

        goto(`/dashboard/work-orders/${workOrderId}`);
    }
</script>

<div class="p-4">
    <h1 class="text-2xl font-bold mb-4">Edit Work Order</h1>
    {#if loading}
        <p>Loading...</p>
    {:else if workOrder}
        <WorkOrderForm 
            workOrderData={workOrder} 
            itemsData={items} 
            on:submit={handleSubmit}
            isEditing={true}
        />
    {:else}
        <p>Work Order not found.</p>
    {/if}
</div>