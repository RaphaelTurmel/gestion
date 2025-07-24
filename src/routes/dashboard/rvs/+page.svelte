<script>
    import { onMount, onDestroy } from 'svelte';
    import { supabase } from '$lib/supabaseClient';
    import { goto } from '$app/navigation';
    import Scanner from '../Scanner.svelte';

    let rvs = [];
    let searchTerm = '';
    let loading = true;
    let showScanner = false;
    let subscription;

    async function loadRVs() {
        loading = true;
        let query = supabase.from('rvs').select('*');
        
        if (searchTerm) {
             query = query.or(`vin.ilike.%${searchTerm}%,make.ilike.%${searchTerm}%,model.ilike.%${searchTerm}%`);
        }
        
        const { data, error } = await query.order('make').order('model');

        if (error) {
            console.error('Error loading RVs:', error);
            rvs = [];
        } else {
            rvs = data;
        }
        loading = false;
    }
    
    function handleScanResult(event) {
        showScanner = false;
        const vin = event.detail.data;
        if (vin) {
            goto(`/dashboard/rvs/${vin}`);
        }
    }
    
    function handleKeyPress(event, vin) {
        if (event.key === 'Enter' || event.key === ' ') {
            goto(`/dashboard/rvs/${vin}`);
        }
    }

    onMount(() => {
        loadRVs();
        
        subscription = supabase.channel('public:rvs')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'rvs' }, payload => {
                loadRVs();
            })
            .subscribe();

        return () => {
            if (subscription) supabase.removeChannel(subscription);
        };
    });
</script>

<div class="p-4">
    <div class="flex justify-between items-center mb-4">
        <h1 class="text-2xl font-bold">RV Inventory</h1>
        <div>
            <button class="btn btn-secondary mr-2" on:click={() => showScanner = true}>Scan VIN</button>
            <button class="btn btn-primary" on:click={() => goto('/dashboard/rvs/new')}>Add RV</button>
        </div>
    </div>
    
    {#if showScanner}
        <Scanner on:scanResult={handleScanResult} on:close={() => showScanner = false}/>
    {/if}

    <div class="form-control mb-4">
        <input
            type="text"
            placeholder="Search by VIN, Make, or Model..."
            class="input input-bordered w-full"
            bind:value={searchTerm}
            on:input={loadRVs}
        />
    </div>

    {#if loading}
        <div class="text-center p-8">
            <span class="loading loading-lg"></span>
        </div>
    {:else if rvs.length === 0}
        <p class="text-center text-gray-500">No RVs found.</p>
    {:else}
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {#each rvs as rv (rv.vin)}
                <div 
                    class="card bg-base-200 shadow-xl hover:shadow-2xl transition-shadow cursor-pointer" 
                    on:click={() => goto(`/dashboard/rvs/${rv.vin}`)}
                    on:keypress={(e) => handleKeyPress(e, rv.vin)}
                    role="link"
                    tabindex="0">
                    <div class="card-body">
                        <div class="flex justify-between items-start">
                            <h2 class="card-title">{rv.year} {rv.make} {rv.model}</h2>
                            <div class="badge badge-accent">{rv.status}</div>
                        </div>
                        <p>{rv.vin}</p>
                    </div>
                </div>
            {/each}
        </div>
    {/if}
</div>