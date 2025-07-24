<script>
    import { onMount, onDestroy } from 'svelte';
    import { supabase } from '$lib/supabaseClient';
    import { goto } from '$app/navigation';

    let parts = [];
    let searchTerm = '';
    let loading = true;
    let subscription;

    async function loadParts() {
        loading = true;
        let query = supabase.from('parts').select('*');
        
        if (searchTerm) {
             query = query.or(`description.ilike.%${searchTerm}%,part_number.ilike.%${searchTerm}%,category.ilike.%${searchTerm}%`);
        }
        
        const { data, error } = await query.order('description');

        if (error) {
            console.error('Error loading parts:', error);
            parts = [];
        } else {
            parts = data;
        }
        loading = false;
    }

    onMount(() => {
        loadParts();
        
        subscription = supabase.channel('public:parts')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'parts' }, loadParts)
            .subscribe();

        return () => {
            if(subscription) supabase.removeChannel(subscription);
        };
    });
</script>

<div class="p-4">
    <div class="flex justify-between items-center mb-4">
        <h1 class="text-2xl font-bold">Parts Inventory</h1>
        <button class="btn btn-primary" on:click={() => goto('/dashboard/parts/new')}>Add Part</button>
    </div>

    <div class="form-control mb-4">
        <input
            type="text"
            placeholder="Search by name, number, or category..."
            class="input input-bordered w-full"
            bind:value={searchTerm}
            on:input={loadParts}
        />
    </div>

    {#if loading}
        <div class="text-center p-8">
            <span class="loading loading-lg"></span>
        </div>
    {:else if parts.length === 0}
        <p class="text-center text-gray-500">No parts found.</p>
    {:else}
        <div class="overflow-x-auto">
            <table class="table w-full">
                <thead>
                    <tr>
                        <th>Part Number</th>
                        <th>Description</th>
                        <th>Category</th>
                        <th>In Stock</th>
                        <th>Price</th>
                    </tr>
                </thead>
                <tbody>
                    {#each parts as part (part.part_number)}
                        <tr class="hover cursor-pointer" on:click={() => goto(`/dashboard/parts/${part.part_number}/edit`)}>
                            <td>{part.part_number}</td>
                            <td>{part.description}</td>
                            <td>{part.category}</td>
                            <td>{part.in_stock_quantity}</td>
                            <td>${part.price.toFixed(2)}</td>
                        </tr>
                    {/each}
                </tbody>
            </table>
        </div>
    {/if}
</div>