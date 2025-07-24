<script>
    import { onMount, onDestroy } from 'svelte';
    import { supabase } from '$lib/supabaseClient';
    import { syncLatestClaims } from '$lib/forestRiverApi.js';

    let claims = [];
    let loading = true;
    let syncMessage = '';
    let subscription;

    async function fetchCachedClaims() {
        loading = true;
        const { data, error } = await supabase
            .from('fr_claims')
            .select('*')
            .order('created_on', { ascending: false })
            .limit(50);

        if (error) {
            syncMessage = `Error fetching cached claims: ${error.message}`;
        } else {
            claims = data || [];
        }
        loading = false;
    }

    async function handleSync() {
        syncMessage = 'Syncing with Forest River...';
        try {
            const result = await syncLatestClaims();
            syncMessage = `Sync successful: ${result.claims_synced} claims updated.`;
        } catch (error) {
            syncMessage = `Sync failed: ${error.message}`;
        }
    }
    
    onMount(() => {
        fetchCachedClaims();
        
        subscription = supabase.channel('public:fr_claims')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'fr_claims' }, payload => {
                console.log('Real-time claim change received!', payload);
                fetchCachedClaims();
            })
            .subscribe();

        return () => {
            if (subscription) supabase.removeChannel(subscription);
        };
    });

    function formatDate(dateString) {
        if (!dateString || dateString.startsWith('1900')) return null;
        try {
            return new Date(dateString).toLocaleDateString();
        } catch (e) {
            return null;
        }
    }
</script>

<div class="space-y-4">
    <div class="flex justify-between items-center">
        <h2 class="text-2xl font-bold">Latest Claims Status</h2>
        <div class="flex items-center gap-2">
            <div class="text-sm italic text-gray-500">{syncMessage}</div>
            <button class="btn btn-secondary btn-sm" on:click={handleSync}>Sync Now</button>
        </div>
    </div>

    {#if loading && claims.length === 0}
        <div class="text-center p-8"><span class="loading loading-lg"></span></div>
    {:else if claims.length === 0}
        <div class="alert alert-info">
            <span>No claims found in the local cache. Try syncing.</span>
        </div>
    {:else}
        <div class="space-y-6">
            {#each claims as claim (claim.rec_id)}
                <div class="card bg-base-200 shadow-md">
                    <div class="card-body p-4">
                        <div class="flex justify-between items-center">
                            <div>
                                <span class="font-bold">Claim #{claim.claim_number}</span>
                                <span class="text-sm ml-2">({claim.vin})</span>
                            </div>
                            <div class="badge badge-accent">{claim.claim_status}</div>
                        </div>
                        <p class="text-sm">Owner: {claim.owner || 'N/A'}</p>
                        
                        <ul class="timeline timeline-vertical mt-4">
                            {#if formatDate(claim.created_on)}
                            <li>
                                <div class="timeline-start text-xs">{formatDate(claim.created_on)}</div>
                                <div class="timeline-middle"><div class="w-3 h-3 rounded-full bg-primary"></div></div>
                                <div class="timeline-end text-sm">Created</div>
                                <hr/>
                            </li>
                            {/if}
                            {#if formatDate(claim.repair_start_date)}
                            <li>
                                <hr/><div class="timeline-start text-xs">{formatDate(claim.repair_start_date)}</div>
                                <div class="timeline-middle"><div class="w-3 h-3 rounded-full bg-secondary"></div></div>
                                <div class="timeline-end text-sm">Repair Started</div>
                                <hr/>
                            </li>
                            {/if}
                             {#if formatDate(claim.payment_date)}
                            <li>
                                <hr/><div class="timeline-start text-xs">{formatDate(claim.payment_date)}</div>
                                <div class="timeline-middle"><div class="w-3 h-3 rounded-full bg-success"></div></div>
                                <div class="timeline-end text-sm">Paid</div>
                            </li>
                            {/if}
                        </ul>
                    </div>
                </div>
            {/each}
        </div>
    {/if}
</div>