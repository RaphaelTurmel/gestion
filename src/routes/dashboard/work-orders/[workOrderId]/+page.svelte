<script>
    import { page } from '$app/stores';
    import { supabase } from '$lib/supabaseClient';
    import { goto } from '$app/navigation';
    import { onMount, onDestroy } from 'svelte';

    export let data;

    // THE CRITICAL FIX: Make the 'items' variable reactive to changes in the 'data' prop.
    $: items = data.items;
    $: workOrder = data.workOrder;
    
    let subscription;

    onMount(() => {
        // Listen for ANY change on the work_order_items table
        subscription = supabase.channel('public:work_order_items')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'work_order_items' }, payload => {
                // When a change occurs, check if it belongs to this work order
                const changedItem = payload.new || payload.old;
                if (changedItem && changedItem.work_order_id === workOrder.id) {
                    // If it does, find it in our local list and update it.
                    // This is more efficient than a full page reload.
                    const index = items.findIndex(i => i.id === changedItem.id);
                    if (index !== -1) {
                        if (payload.eventType === 'DELETE') {
                            items.splice(index, 1);
                        } else {
                            items[index] = { ...items[index], ...changedItem };
                        }
                        items = items; // Trigger Svelte's reactivity
                    } else if (payload.eventType === 'INSERT') {
                        items = [...items, payload.new];
                    }
                }
            })
            .subscribe();
    });

    onDestroy(() => {
        // Important: clean up the subscription when the user navigates away
        if (subscription) {
            supabase.removeChannel(subscription);
        }
    });

    async function updateItemStatus(item, newStatus) {
        const { error } = await supabase
            .from('work_order_items')
            .update({ status: newStatus })
            .eq('id', item.id);

        if (error) {
            alert(`Failed to update status: ${error.message}`);
            // Note: No need to revert UI, the realtime subscription will fetch the true state.
        }
    }
</script>

<div class="p-4">
    {#if workOrder}
        <div class="flex justify-between items-center mb-4">
            <div>
                <h1 class="text-3xl font-bold">{workOrder.title}</h1>
                <p class="text-lg text-gray-600">{workOrder.rvs?.year} {workOrder.rvs?.make} {workOrder.rvs?.model} ({workOrder.vin})</p>
                {#if workOrder.clients}
                <p class="text-md">Client: {workOrder.clients.first_name} {workOrder.clients.last_name}</p>
                {/if}
                <p class="text-sm">Date: {new Date(workOrder.created_date).toLocaleDateString()}</p>
            </div>
            <a href="/dashboard/work-orders/{workOrder.id}/edit" class="btn btn-outline">Edit</a>
        </div>

        <div class="divider"></div>

        <h2 class="text-xl font-bold mb-2">Tasks</h2>
        {#if items.length > 0}
            <div class="space-y-4">
                {#each items as item (item.id)}
                    <div class="card bg-base-100 shadow-md">
                        <div class="card-body">
                            <div class="flex justify-between items-start">
                                <h3 class="font-bold">{item.description}</h3>
                                <div class="badge" class:badge-warning={item.status === 'PENDING' || item.status === 'IN_PROGRESS'} class:badge-error={item.status === 'BLOCKED'} class:badge-success={item.status === 'COMPLETED'}>{item.status.replace('_', ' ')}</div>
                            </div>
                            <p class="text-sm"><strong>Technician:</strong> {item.technician || 'N/A'}</p>
                            <p class="text-sm"><strong>Notes:</strong> {item.notes || 'N/A'}</p>
                            <div class="card-actions justify-end">
                                <select 
                                    class="select select-bordered select-sm"
                                    value={item.status}
                                    on:change={(e) => updateItemStatus(item, e.currentTarget.value)}
                                >
                                    <option value="PENDING">Pending</option>
                                    <option value="IN_PROGRESS">In Progress</option>
                                    <option value="BLOCKED">Blocked</option>
                                    <option value="COMPLETED">Completed</option>
                                </select>
                            </div>
                        </div>
                    </div>
                {/each}
            </div>
        {:else}
            <p>No tasks found for this work order.</p>
        {/if}
    {:else}
        <p>Work Order not found.</p>
    {/if}
</div>