<script>
    import { createEventDispatcher, onMount } from 'svelte';
    import { supabase } from '$lib/supabaseClient';
    import MediaManager from '$lib/components/MediaManager.svelte';

    export let inspectionData = {};
    export let itemsData = [];
    export let isEditing = false;

    const dispatch = createEventDispatcher();
    
    let rvs = [];
    let inspection = {
        vin: inspectionData.vin || '',
        title: inspectionData.title || '',
        inspection_type: inspectionData.inspection_type || 'PDI (Pre-Delivery Inspection)',
    };
    let items = [...itemsData.map(item => ({...item, image_uris: item.image_uris || [], video_uris: item.video_uris || []}))];

    onMount(async () => {
        const { data } = await supabase.from('rvs').select('vin, year, make, model').order('year', { ascending: false });
        if (data) rvs = data;
    });

    const inspectionTypes = ['PDI (Pre-Delivery Inspection)', 'Warranty', 'Evaluation', 'Service Check-in'];

    function addItem() {
        items = [...items, { 
            id: `new-${Date.now()}`, 
            defect_description: '', 
            location: '',
            image_uris: [],
            video_uris: []
        }];
    }

    function removeItem(index) {
        items.splice(index, 1);
        items = items;
    }

    function save() {
        if (!inspection.vin || !inspection.title) {
            alert('RV (VIN) and Inspection Title are required.');
            return;
        }
        dispatch('submit', { inspection, items });
    }
</script>

<form on:submit|preventDefault={save} class="space-y-4 max-w-2xl mx-auto">
    <div class="form-control">
        <label class="label" for="rvVin"><span class="label-text">Select RV (by VIN) *</span></label>
        <select bind:value={inspection.vin} id="rvVin" class="select select-bordered" disabled={isEditing}>
            <option value="" disabled>Select an RV</option>
            {#each rvs as rv}
                <option value={rv.vin}>{rv.year} {rv.make} {rv.model} - ({rv.vin})</option>
            {/each}
        </select>
    </div>

    <div class="form-control">
        <label class="label" for="title"><span class="label-text">Inspection Title *</span></label>
        <input bind:value={inspection.title} id="title" type="text" class="input input-bordered" />
    </div>
    
    <div class="form-control">
        <label class="label" for="type"><span class="label-text">Inspection Type</span></label>
        <select bind:value={inspection.inspection_type} id="type" class="select select-bordered">
            {#each inspectionTypes as type}
                <option value={type}>{type}</option>
            {/each}
        </select>
    </div>
    
    <div class="divider"></div>
    
    <div class="flex justify-between items-center">
        <h2 class="text-lg font-bold">Defect Items</h2>
        <button type="button" class="btn btn-sm btn-secondary" on:click={addItem}>Add Item</button>
    </div>
    
    <div class="space-y-4">
        {#each items as item, i (item.id)}
            <div class="p-4 border rounded-lg bg-base-200">
                <div class="form-control">
                    <label class="label text-sm" for="desc-{i}"><span class="label-text">Description</span></label>
                    <textarea bind:value={item.defect_description} id="desc-{i}" class="textarea textarea-bordered textarea-sm" rows="2"></textarea>
                </div>
                 <div class="form-control mt-2">
                    <label class="label text-sm" for="loc-{i}"><span class="label-text">Location</span></label>
                    <input bind:value={item.location} id="loc-{i}" type="text" class="input input-bordered input-sm" />
                </div>
                
                <div class="divider mt-4">Media for this Item</div>
                <div class="space-y-4 p-2">
                     <MediaManager 
                        mediaType="image"
                        bucketName="inspection_media"
                        entityId={item.id}
                        initialUrls={item.image_uris}
                        on:urlsChanged={(e) => item.image_uris = e.detail}
                    />
                    <MediaManager 
                        mediaType="video"
                        bucketName="inspection_media"
                        entityId={item.id}
                        initialUrls={item.video_uris}
                        on:urlsChanged={(e) => item.video_uris = e.detail}
                    />
                </div>

                 <div class="text-right mt-2">
                     <button type="button" class="btn btn-xs btn-ghost text-error" on:click={() => removeItem(i)}>Remove Item</button>
                 </div>
            </div>
        {/each}
        {#if items.length === 0}
            <p class="text-center italic text-gray-500">No defect items added.</p>
        {/if}
    </div>

    <div class="flex justify-end mt-6">
        <button type="submit" class="btn btn-primary">Save Inspection</button>
    </div>
</form>