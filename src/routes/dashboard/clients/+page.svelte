<script>
    import { onMount } from 'svelte';
    import { supabase } from '$lib/supabaseClient';
    import { goto } from '$app/navigation';

    let clients = [];
    let searchTerm = '';
    let loading = true;

    async function loadClients() {
        loading = true;
        
        let query = supabase.from('clients_with_counts').select(`
            id,
            first_name,
            last_name,
            cell_phone,
            rvs:rv_count,
            work_orders:work_order_count
        `);
        
        if (searchTerm) {
             query = query.or(`first_name.ilike.%${searchTerm}%,last_name.ilike.%${searchTerm}%`);
        }
        
        const { data, error } = await query.order('last_name');

        if (error) {
            console.error('Error loading clients:', error);
            clients = [];
        } else {
            // The result from the join count is an array, we need the count property
            clients = data.map(c => ({
                ...c,
                rv_count: c.rvs[0]?.count || 0,
                work_order_count: c.work_orders[0]?.count || 0,
            }));
        }
        loading = false;
    }

    onMount(() => {
        loadClients();

        const subscription = supabase.channel('public:clients')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'clients' }, loadClients)
            .subscribe();

        return () => supabase.removeChannel(subscription);
    });

    $: filteredClients = clients; // Search is now handled by the query
</script>

<div class="p-4">
    <div class="flex justify-between items-center mb-4">
        <h1 class="text-2xl font-bold">Clients</h1>
        <button class="btn btn-primary" on:click={() => goto('/dashboard/clients/new')}>Add Client</button>
    </div>

    <div class="form-control mb-4">
        <input
            type="text"
            placeholder="Search by name..."
            class="input input-bordered w-full"
            bind:value={searchTerm}
            on:input={loadClients}
        />
    </div>

    {#if loading}
        <div class="text-center p-8">
            <span class="loading loading-lg"></span>
        </div>
    {:else if filteredClients.length === 0}
        <p class="text-center text-gray-500">No clients found.</p>
    {:else}
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {#each filteredClients as client (client.id)}
                <div class="card bg-base-100 shadow-xl hover:shadow-2xl transition-shadow cursor-pointer" on:click={() => goto(`/dashboard/clients/${client.id}`)}>
                    <div class="card-body">
                        <h2 class="card-title">{client.first_name} {client.last_name}</h2>
                        <p>{client.cell_phone}</p>
                        <div class="card-actions justify-end">
                            <div class="badge badge-outline">RVs: {client.rv_count}</div>
                            <div class="badge badge-outline">WOs: {client.work_order_count}</div>
                        </div>
                    </div>
                </div>
            {/each}
        </div>
    {/if}
</div>