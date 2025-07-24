<script>
    import { goto } from '$app/navigation';
    import MediaViewer from '$lib/components/MediaViewer.svelte';
    import { onMount, onDestroy } from 'svelte';
    import { supabase } from '$lib/supabaseClient';

    export let data;

    $: ({ rv, workOrders, inspections } = data);

    $: inspectionImages = inspections.flatMap(i => 
        i.inspection_items.flatMap(item => item.image_uris || [])
    );
    $: inspectionVideos = inspections.flatMap(i => 
        i.inspection_items.flatMap(item => item.video_uris || [])
    );

    let subscriptions = [];

    onMount(() => {
        // Real-time listener for the main RV object
        const rvChannel = supabase.channel(`public:rvs:vin=eq.${rv.vin}`)
            .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'rvs' }, payload => {
                rv = {...rv, ...payload.new};
            }).subscribe();
        
        // You could add more listeners here for work orders and inspections if needed
        
        subscriptions.push(rvChannel);

        return () => {
            subscriptions.forEach(sub => supabase.removeChannel(sub));
        };
    });
</script>

<div class="p-4">
    {#if rv}
        <div class="flex justify-between items-start mb-4">
            <div>
                <h1 class="text-3xl font-bold">{rv.year} {rv.make} {rv.model}</h1>
                <p class="text-lg text-gray-500">{rv.vin}</p>
            </div>
            <a href="/dashboard/rvs/{rv.vin}/edit" class="btn btn-outline flex-shrink-0">Edit Details</a>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div class="md:col-span-2 space-y-6">
                <div class="card bg-primary text-primary-content shadow-md">
                    <div class="card-body">
                        <h2 class="card-title">RV Information</h2>
                        <div class="grid grid-cols-2 gap-4 text-sm sm:text-base">
                            <div><strong>Status:</strong> <span class="badge badge-neutral">{rv.status}</span></div>
                            <div><strong>Price:</strong> ${rv.price.toLocaleString()}</div>
                            <div><strong>Mileage:</strong> {rv.mileage.toLocaleString()} mi</div>
                        </div>
                        <div class="mt-4">
                            <p><strong>Description:</strong> {rv.description || 'N/A'}</p>
                        </div>
                    </div>
                </div>

                <div class="card bg-base-300 shadow-md">
                    <div class="card-body">
                        <h2 class="card-title">Work Orders</h2>
                        {#if workOrders.length > 0}
                            <div class="overflow-x-auto">
                                <table class="table table-zebra table-sm">
                                    <tbody>
                                        {#each workOrders as wo}
                                            <tr class="hover cursor-pointer" on:click={() => goto(`/dashboard/work-orders/${wo.id}`)}>
                                                <td>{wo.title}</td>
                                                <td>{new Date(wo.created_date).toLocaleDateString()}</td>
                                            </tr>
                                        {/each}
                                    </tbody>
                                </table>
                            </div>
                        {:else}
                            <p class="italic text-sm">No work orders found for this RV.</p>
                        {/if}
                    </div>
                </div>
                
                <div class="card bg-base-300 shadow-md">
                    <div class="card-body">
                        <h2 class="card-title">Inspections</h2>
                         {#if inspections.length > 0}
                            <div class="overflow-x-auto">
                                <table class="table table-zebra table-sm">
                                    <tbody>
                                        {#each inspections as insp}
                                            <tr class="hover cursor-pointer" on:click={() => goto(`/dashboard/inspections/${insp.id}`)}>
                                                <td>{insp.title}</td>
                                                <td>{new Date(insp.date).toLocaleDateString()}</td>
                                            </tr>
                                        {/each}
                                    </tbody>
                                </table>
                            </div>
                        {:else}
                            <p class="italic text-sm">No inspections found for this RV.</p>
                        {/if}
                    </div>
                </div>
            </div>
            
            <div class="md:col-span-1 space-y-6">
                <div class="card bg-secondary text-secondary-content shadow-md md:sticky md:top-4">
                    <div class="card-body">
                        <h2 class="card-title">Owner Information</h2>
                        {#if rv.clients}
                            <p class="font-bold">{rv.clients.first_name} {rv.clients.last_name}</p>
                            <p>{rv.clients.cell_phone}</p>
                            <a href="/dashboard/clients/{rv.clients.id}" class="btn btn-sm btn-link p-0 mt-2 text-secondary-content">View Client Details</a>
                        {:else}
                            <p>This RV is currently owned by the dealership.</p>
                        {/if}
                    </div>
                </div>
                
                <div class="card bg-base-200 shadow-md">
                    <div class="card-body">
                        <h2 class="card-title">General Media</h2>
                        <MediaViewer title="Photos" mediaType="image" urls={rv.image_uris} />
                        <div class="divider my-2"></div>
                        <MediaViewer title="Videos" mediaType="video" urls={rv.video_uris} />
                    </div>
                </div>
            </div>
        </div>
        
    {:else}
         <div class="text-center p-8">
            <h2 class="text-2xl font-bold">RV not found.</h2>
            <p>The RV you are looking for does not exist or could not be loaded.</p>
            <a href="/dashboard/rvs" class="btn btn-primary mt-4">Back to RV List</a>
        </div>
    {/if}
</div>