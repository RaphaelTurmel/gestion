<script>
    import { onMount } from 'svelte';
    import { supabase } from '$lib/supabaseClient';
    import { goto } from '$app/navigation';

    let inspections = [];
    let loading = true;

    async function loadInspections() {
        loading = true;
        const { data, error } = await supabase
            .from('inspections')
            .select(`
                id,
                title,
                vin,
                date,
                rvs ( make, model, year )
            `)
            .order('date', { ascending: false });

        if (error) {
            console.error("Error loading inspections:", error);
        } else {
            inspections = data;
        }
        loading = false;
    }

    onMount(() => {
        loadInspections();

        const subscription = supabase.channel('public:inspections')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'inspections' }, loadInspections)
            .subscribe();
        
        const itemSubscription = supabase.channel('public:inspection_items')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'inspection_items' }, loadInspections)
            .subscribe();

        return () => {
            supabase.removeChannel(subscription);
            supabase.removeChannel(itemSubscription);
        }
    });
</script>

<div class="p-4">
    <div class="flex justify-between items-center mb-4">
        <h1 class="text-2xl font-bold">All Inspections</h1>
        <button class="btn btn-primary" on:click={() => goto('/dashboard/inspections/new')}>New Inspection</button>
    </div>

    {#if loading}
        <div class="text-center"><span class="loading loading-lg"></span></div>
    {:else if inspections.length === 0}
        <p>No inspections found.</p>
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
                    {#each inspections as inspection (inspection.id)}
                        <tr class="hover cursor-pointer" on:click={() => goto(`/dashboard/inspections/${inspection.id}`)}>
                            <td>{new Date(inspection.date).toLocaleDateString()}</td>
                            <td>{inspection.title}</td>
                            <td>{inspection.rvs ? `${inspection.rvs.year} ${inspection.rvs.make} ${inspection.rvs.model}` : 'N/A'}</td>
                            <td>{inspection.vin}</td>
                        </tr>
                    {/each}
                </tbody>
            </table>
        </div>
    {/if}
</div>