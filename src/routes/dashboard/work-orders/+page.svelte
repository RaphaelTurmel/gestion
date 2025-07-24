<script>
    import { onMount } from 'svelte';
    import { supabase } from '$lib/supabaseClient';
    import { goto } from '$app/navigation';

    let workOrders = [];
    let loading = true;

    async function loadWorkOrders() {
        loading = true;
        const { data, error } = await supabase
            .from('work_orders')
            .select(`
                id,
                title,
                created_date,
                vin,
                rvs ( make, model, year )
            `)
            .order('created_date', { ascending: false });

        if (error) {
            console.error("Error loading work orders:", error);
        } else {
            workOrders = data;
        }
        loading = false;
    }

    onMount(() => {
        loadWorkOrders();

        const subscription = supabase.channel('public:work_orders')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'work_orders' }, loadWorkOrders)
            .subscribe();

        const itemSubscription = supabase.channel('public:work_order_items')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'work_order_items' }, loadWorkOrders)
            .subscribe();
        
        return () => {
            supabase.removeChannel(subscription);
            supabase.removeChannel(itemSubscription);
        }
    });
</script>

<div class="p-4">
    <div class="flex justify-between items-center mb-4">
        <h1 class="text-2xl font-bold">All Work Orders</h1>
        <button class="btn btn-primary" on:click={() => goto('/dashboard/work-orders/new')}>New Work Order</button>
    </div>

    {#if loading}
        <div class="text-center"><span class="loading loading-lg"></span></div>
    {:else if workOrders.length === 0}
        <p>No work orders found.</p>
    {:else}
        <div class="overflow-x-auto">
            <table class="table w-full">
                <thead>
                    <tr>
                        <th>Date</th>
                        <th>Title</th>
                        <th>RV</th>
                        <th>VIN</th>
                    </tr>
                </thead>
                <tbody>
                    {#each workOrders as wo (wo.id)}
                        <tr class="hover cursor-pointer" on:click={() => goto(`/dashboard/work-orders/${wo.id}`)}>
                            <td>{new Date(wo.created_date).toLocaleDateString()}</td>
                            <td>{wo.title}</td>
                            <td>{wo.rvs ? `${wo.rvs.year} ${wo.rvs.make} ${wo.rvs.model}` : 'N/A'}</td>
                            <td>{wo.vin}</td>
                        </tr>
                    {/each}
                </tbody>
            </table>
        </div>
    {/if}
</div>