<script>
    import { onMount, onDestroy } from 'svelte';
    import { supabase } from '$lib/supabaseClient';
    import { goto } from '$app/navigation';
    import Scanner from '../Scanner.svelte';

    let allClients = [];
    let filteredClients = [];
    let searchTerm = '';
    let loading = true;
    let subscription;
    let showScanner = false;

    async function loadClients() {
        loading = true;
        
        const { data, error } = await supabase.rpc('get_all_clients_with_counts');

        if (error) {
            console.error('Error loading clients with counts:', error);
            allClients = [];
        } else {
            allClients = data;
        }
        
        filterClients();
        loading = false;
    }

    function filterClients() {
        if (!searchTerm) {
            filteredClients = allClients;
            return;
        }
        const lowerCaseSearchTerm = searchTerm.toLowerCase();
        filteredClients = allClients.filter(client => 
            client.first_name.toLowerCase().includes(lowerCaseSearchTerm) ||
            client.last_name.toLowerCase().includes(lowerCaseSearchTerm)
        );
    }

    function handleScanResult(event) {
        showScanner = false;
        const clientId = event.detail.data;
        if (clientId) {
            goto(`/dashboard/clients/${clientId}`);
        }
    }
     function handleKeyPress(event, clientId) {
        if (event.key === 'Enter' || event.key === ' ') {
            goto(`/dashboard/clients/${clientId}`);
        }
    }

    onMount(() => {
        loadClients();
        
        // This subscription re-runs the function when underlying data changes
        subscription = supabase.channel('clients-counts-realtime')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'clients' }, loadClients)
            .on('postgres_changes', { event: '*', schema: 'public', table: 'rvs' }, loadClients)
            .on('postgres_changes', { event: '*', schema: 'public', table: 'work_orders' }, loadClients)
            .on('postgres_changes', { event: '*', schema: 'public', table: 'inspections' }, loadClients)
            .subscribe();

        return () => {
            if (subscription) supabase.removeChannel(subscription);
        };
    });

    $: filterClients(searchTerm);

</script>

<div class="p-4">
    <div class="flex justify-between items-center mb-4">
        <h1 class="text-2xl font-bold">Clients</h1>
        <div>
            <button class="btn btn-secondary mr-2" on:click={() => showScanner = true}>Scan Client</button>
            <a href="/dashboard/clients/new" class="btn btn-primary">Add Client</a>
        </div>
    </div>
    
    {#if showScanner}
        <Scanner on:scanResult={handleScanResult} on:close={() => showScanner = false}/>
    {/if}

    <div class="form-control mb-4">
        <input
            type="text"
            placeholder="Search by name..."
            class="input input-bordered w-full"
            bind:value={searchTerm}
        />
    </div>

    {#if loading}
        <div class="flex justify-center items-center p-8">
            <span class="loading loading-spinner text-primary loading-lg"></span>
        </div>
    {:else if filteredClients.length === 0}
        <div class="text-center p-8">
            <h2 class="text-xl font-semibold">No clients found</h2>
            <p class="text-gray-500 mt-2">Create a new client to get started.</p>
        </div>
    {:else}
        <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {#each filteredClients as client (client.id)}
                <div 
                    class="card bg-base-100 shadow-lg hover:shadow-2xl transition-shadow duration-300 cursor-pointer group"
                    on:click={() => goto(`/dashboard/clients/${client.id}`)}
                    on:keypress={(e) => handleKeyPress(e, client.id)}
                    role="button"
                    tabindex="0"
                >
                    <div class="card-body">
                        <h2 class="card-title text-lg font-bold group-hover:text-primary transition-colors">
                            {client.first_name} {client.last_name}
                        </h2>
                        <p class="text-sm text-gray-500 mb-4">{client.cell_phone}</p>
                        <div class="flex justify-around text-center">
                            <div>
                                <p class="font-bold text-xl">{client.rv_count}</p>
                                <p class="text-xs text-gray-400">RVs</p>
                            </div>
                            <div>
                                <p class="font-bold text-xl">{client.work_order_count}</p>
                                <p class="text-xs text-gray-400">WOs</p>
                            </div>
                            <div>
                                <p class="font-bold text-xl">{client.inspection_count}</p>
                                <p class="text-xs text-gray-400">Inspections</p>
                            </div>
                        </div>
                    </div>
                </div>
            {/each}
        </div>
    {/if}
</div>