<script>
    import { page } from '$app/stores';
    import { onMount } from 'svelte';
    import { supabase } from '$lib/supabaseClient';
    import { goto } from '$app/navigation';
    import QRCode from 'qrcode';

    let client = null;
    let rvs = [];
    let work_orders = [];
    let inspections = [];
    
    let loading = true;
    let errorMessage = '';
    let qrCodeUrl = '';
    let activeTab = 'rvs';

    async function loadClientData() {
        loading = true;
        const clientId = $page.params.clientId;

        // --- Fetch Client Details, RVs, and Work Orders in Parallel ---
        const clientPromise = supabase.rpc('get_client_details', { client_id_param: clientId });
        const rvsPromise = supabase.from('rvs').select('*').eq('owner_client_id', clientId);
        const workOrdersPromise = supabase.from('work_orders').select('*').eq('client_id', clientId);
        const inspectionsPromise = supabase.rpc('get_inspections_for_client', { p_client_id: clientId });

        const [
            clientResult,
            rvsResult,
            workOrdersResult,
            inspectionsResult
        ] = await Promise.all([clientPromise, rvsPromise, workOrdersPromise, inspectionsPromise]);

        // --- Process Client Details ---
        if (clientResult.error) {
            console.error('Error loading client details:', clientResult.error);
            errorMessage = clientResult.error.message;
            loading = false;
            return;
        }
        client = clientResult.data[0];

        if (client) {
            QRCode.toDataURL(client.id.toString(), { errorCorrectionLevel: 'H', width: 256 }, (err, url) => {
                if (err) console.error(err);
                qrCodeUrl = url;
            });
        }
        
        // --- Process Related Items ---
        if(rvsResult.error) console.error("Error fetching RVs:", rvsResult.error.message);
        else rvs = rvsResult.data;

        if(workOrdersResult.error) console.error("Error fetching WOs:", workOrdersResult.error.message);
        else work_orders = workOrdersResult.data;

        if(inspectionsResult.error) console.error("Error fetching Inspections:", inspectionsResult.error.message);
        else inspections = inspectionsResult.data;

        loading = false;
    }

    async function deleteClient() {
        if (confirm('Are you sure you want to delete this client? This action cannot be undone.')) {
            const { error } = await supabase.from('clients').delete().eq('id', $page.params.clientId);
            if (error) alert(`Error deleting client: ${error.message}`);
            else goto('/dashboard/clients');
        }
    }

    onMount(loadClientData);
</script>

<div class="p-4">
    {#if loading}
        <div class="text-center p-8"><span class="loading loading-lg"></span></div>
    {:else if errorMessage}
        <div class="alert alert-error">
             <svg xmlns="http://www.w3.org/2000/svg" class="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            <span>Error: {errorMessage}</span>
        </div>
    {:else if client}
        <div class="flex justify-between items-center mb-4">
            <h1 class="text-2xl font-bold">{client.first_name} {client.last_name}</h1>
            <div>
                <a href={`/dashboard/clients/${client.id}/edit`} class="btn btn-secondary mr-2">Edit</a>
                <button on:click={deleteClient} class="btn btn-error">Delete</button>
            </div>
        </div>

        <!-- Client Details & QR Code -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div class="md:col-span-2 card bg-base-200 shadow-xl">
                <div class="card-body">
                    <p><strong>Email:</strong> {client.email || 'N/A'}</p>
                    <p><strong>Phone:</strong> {client.cell_phone || 'N/A'}</p>
                    <p><strong>Address:</strong> {client.address_street || 'N/A'}</p>
                    <div class="divider"></div>
                    <div class="flex justify-around text-center">
                        <div><p class="font-bold text-2xl">{client.rv_count}</p><p class="text-sm text-gray-400">RVs</p></div>
                        <div><p class="font-bold text-2xl">{client.work_order_count}</p><p class="text-sm text-gray-400">WOs</p></div>
                        <div><p class="font-bold text-2xl">{client.inspection_count}</p><p class="text-sm text-gray-400">Inspections</p></div>
                    </div>
                </div>
            </div>
            <div class="card bg-base-200 shadow-xl">
                <div class="card-body items-center text-center">
                    {#if qrCodeUrl}<img src={qrCodeUrl} alt="Client QR Code" class="w-full max-w-xs" />{/if}
                    <p class="text-sm text-gray-500 mt-2">Scan for quick access</p>
                </div>
            </div>
        </div>

        <!-- Related Information Tabs -->
        <div class="tabs tabs-boxed mb-4">
            <a class="tab" class:tab-active={activeTab === 'rvs'} on:click={() => activeTab = 'rvs'}>RVs ({rvs.length})</a> 
            <a class="tab" class:tab-active={activeTab === 'work_orders'} on:click={() => activeTab = 'work_orders'}>Work Orders ({work_orders.length})</a> 
            <a class="tab" class:tab-active={activeTab === 'inspections'} on:click={() => activeTab = 'inspections'}>Inspections ({inspections.length})</a>
        </div>

        <!-- Tab Content -->
        <div class="bg-base-200 p-4 rounded-box">
            {#if activeTab === 'rvs'}
                {#each rvs as rv (rv.vin)}
                    <a href={`/dashboard/rvs/${rv.vin}`} class="block hover:bg-base-100 rounded p-2 mb-2">
                        <p class="font-bold">{rv.year} {rv.make} {rv.model}</p>
                        <p class="text-sm text-gray-500">{rv.vin}</p>
                    </a>
                {:else}
                    <p class="text-center text-gray-500">No RVs found for this client.</p>
                {/each}
            {/if}

            {#if activeTab === 'work_orders'}
                {#each work_orders as wo (wo.id)}
                    <a href={`/dashboard/work-orders/${wo.id}`} class="block hover:bg-base-100 rounded p-2 mb-2">
                        <p class="font-bold">{wo.title}</p>
                        <p class="text-sm text-gray-500">Created: {new Date(wo.created_date).toLocaleDateString()}</p>
                    </a>
                {:else}
                    <p class="text-center text-gray-500">No work orders found for this client.</p>
                {/each}
            {/if}

            {#if activeTab === 'inspections'}
                {#each inspections as insp (insp.id)}
                     <a href={`/dashboard/inspections/${insp.id}`} class="block hover:bg-base-100 rounded p-2 mb-2">
                        <p class="font-bold">{insp.title}</p>
                        <p class="text-sm text-gray-500">VIN: {insp.vin} | Date: {new Date(insp.date).toLocaleDateString()}</p>
                    </a>
                {:else}
                    <p class="text-center text-gray-500">No inspections found for this client.</p>
                {/each}
            {/if}
        </div>
    {/if}
</div>
