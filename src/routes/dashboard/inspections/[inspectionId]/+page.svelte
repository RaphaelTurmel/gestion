<script>
    import { supabase } from '$lib/supabaseClient';
    import { goto } from '$app/navigation';
    import { onMount, onDestroy } from 'svelte';

    export let data;
    
    $: inspection = data.inspection;
    $: items = data.items;

    let subscription;

    onMount(() => {
        subscription = supabase.channel(`public:inspection_items:inspection_id=eq.${inspection.id}`)
            .on('postgres_changes', { event: '*', schema: 'public', table: 'inspection_items' }, payload => {
                const changedItem = payload.new || payload.old;
                if (changedItem) {
                    const index = items.findIndex(i => i.id === changedItem.id);
                    if (index !== -1) {
                         if (payload.eventType === 'DELETE') {
                            items.splice(index, 1);
                        } else {
                            items[index] = { ...items[index], ...changedItem };
                        }
                        items = items;
                    } else if (payload.eventType === 'INSERT') {
                        items = [...items, payload.new];
                    }
                }
            })
            .subscribe();
    });

     onDestroy(() => {
        if (subscription) {
            supabase.removeChannel(subscription);
        }
    });

    async function toggleItemStatus(item) {
        const newStatus = item.status === 'Open' ? 'Resolved' : 'Open';
        
        const { error } = await supabase
            .from('inspection_items')
            .update({ status: newStatus })
            .eq('id', item.id);

        if (error) {
            alert(`Failed to update status: ${error.message}`);
        }
    }
</script>

<div class="p-4">
    {#if inspection}
        <div class="flex justify-between items-center mb-4">
            <div>
                <h1 class="text-3xl font-bold">{inspection.title}</h1>
                <p class="text-lg text-gray-600">{inspection.rvs?.year} {inspection.rvs?.make} {inspection.rvs?.model} ({inspection.vin})</p>
                <p class="text-sm">Date: {new Date(inspection.date).toLocaleDateString()}</p>
            </div>
            <a href="/dashboard/inspections/{inspection.id}/edit" class="btn btn-outline">Edit</a>
        </div>

        <div class="divider"></div>

        <h2 class="text-xl font-bold mb-2">Defect Items</h2>
        {#if items.length > 0}
            <div class="space-y-4">
                {#each items as item (item.id)}
                    <div class="card bg-base-100 shadow-md">
                        <div class="card-body">
                             <div class="flex justify-between items-start">
                                <h3 class="font-bold">{item.defect_description}</h3>
                                <div class="badge" class:badge-warning={item.status === 'Open'} class:badge-success={item.status === 'Resolved'}>{item.status}</div>
                            </div>
                            <p class="text-sm"><strong>Location:</strong> {item.location || 'N/A'}</p>
                             <div class="card-actions justify-end">
                                <button 
                                    class="btn btn-sm"
                                    class:btn-success={item.status === 'Open'}
                                    class:btn-warning={item.status === 'Resolved'}
                                    on:click={() => toggleItemStatus(item)}
                                >
                                    {#if item.status === 'Open'}
                                        Mark as Resolved
                                    {:else}
                                        Re-open
                                    {/if}
                                </button>
                            </div>
                        </div>
                    </div>
                {/each}
            </div>
        {:else}
            <p>No defect items were recorded for this inspection.</p>
        {/if}
    {:else}
        <p>Inspection not found.</p>
    {/if}
</div>