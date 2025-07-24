<script>
    import { onMount } from 'svelte';
    import { page } from '$app/stores';
    import { supabase } from '$lib/supabaseClient';
    import { goto } from '$app/navigation';

    let client = null;
    let rvs = [];
    let workOrders = [];
    let campsites = [];
    let loading = true;
    const clientId = $page.params.clientId;

    async function loadClientData() {
        loading = true;
        const { data: clientData, error: clientError } = await supabase
            .from('clients')
            .select('*')
            .eq('id', clientId)
            .single();

        if (clientData) client = clientData;

        const { data: rvData } = await supabase
            .from('rvs')
            .select('*')
            .eq('owner_client_id', clientId);
        if (rvData) rvs = rvData;

        const { data: woData } = await supabase
            .from('work_orders')
            .select('*')
            .eq('client_id', clientId);
        if (woData) workOrders = woData;
        
        const { data: campsiteData } = await supabase
            .from('campsites')
            .select('*')
            .eq('client_id', clientId);
        if (campsiteData) campsites = campsiteData;

        loading = false;
    }
    
    onMount(() => {
        loadClientData();
    });
</script>

<div class="p-4">
    {#if loading}
        <div class="text-center"><span class="loading loading-lg"></span></div>
    {:else if client}
        <div class="mb-6">
            <div class="flex justify-between items-center">
                <h1 class="text-3xl font-bold">{client.first_name} {client.last_name}</h1>
                <button class="btn btn-sm btn-outline" on:click={() => goto(`/dashboard/clients/${client.id}/edit`)}>Edit</button>
            </div>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <!-- Contact Info -->
            <div class="card bg-base-100 shadow-md">
                <div class="card-body">
                    <h2 class="card-title">Contact Information</h2>
                    <p><strong>Cell:</strong> {client.cell_phone || 'N/A'}</p>
                    <p><strong>Landline:</strong> {client.landline_phone || 'N/A'}</p>
                    <p><strong>Email:</strong> {client.email || 'N/A'}</p>
                </div>
            </div>

            <!-- Address -->
            <div class="card bg-base-100 shadow-md">
                <div class="card-body">
                    <h2 class="card-title">Address</h2>
                    <p>{client.address_street || 'No Street Address'}</p>
                    <p>{client.address_city}, {client.address_state} {client.address_zip}</p>
                </div>
            </div>
        </div>
        
        <!-- Campsites -->
        {#if campsites.length > 0}
            <div class="mt-6">
                <h2 class="text-xl font-bold mb-2">Campsites</h2>
                <div class="overflow-x-auto">
                    <table class="table w-full">
                        <thead>
                            <tr>
                                <th>Site Name</th>
                                <th>Lot Number</th>
                            </tr>
                        </thead>
                        <tbody>
                            {#each campsites as site}
                                <tr>
                                    <td>{site.site_name}</td>
                                    <td>{site.lot_number}</td>
                                </tr>
                            {/each}
                        </tbody>
                    </table>
                </div>
            </div>
        {/if}

        <!-- Owned RVs -->
        <div class="mt-6">
            <h2 class="text-xl font-bold mb-2">Owned RVs</h2>
            {#if rvs.length > 0}
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {#each rvs as rv}
                         <div class="card bg-base-100 shadow-md cursor-pointer" on:click={() => goto(`/dashboard/rvs/${rv.vin}`)}>
                             <div class="card-body">
                                 <h3 class="font-bold">{rv.year} {rv.make} {rv.model}</h3>
                                 <p class="text-sm">{rv.vin}</p>
                             </div>
                         </div>
                    {/each}
                </div>
            {:else}
                <p>No RVs assigned to this client.</p>
            {/if}
        </div>
        
    {:else}
        <p>Client not found.</p>
    {/if}
</div>