<script>
    import { createEventDispatcher, onMount } from 'svelte';
    import { supabase } from '$lib/supabaseClient';
    import MediaManager from '$lib/components/MediaManager.svelte';

    export let rvData = {};
    export let clients = [];
    export let isEditing = false;
    
    const dispatch = createEventDispatcher();
    
    let rv = {
        vin: rvData.vin || '',
        make: rvData.make || '',
        model: rvData.model || '',
        year: rvData.year || new Date().getFullYear(),
        price: rvData.price || 0,
        mileage: rvData.mileage || 0,
        status: rvData.status || 'In Stock',
        description: rvData.description || '',
        owner_client_id: rvData.owner_client_id || null,
        image_uris: rvData.image_uris || [],
        video_uris: rvData.video_uris || []
    };
    
    const statusOptions = ['In Stock', 'Sold', 'In Service', 'Awaiting PDI'];
    
    function save() {
        if (!rv.vin || !rv.make || !rv.model) {
            alert('VIN, Make, and Model are required.');
            return;
        }
        if (rv.owner_client_id === 'null' || rv.owner_client_id === '') {
            rv.owner_client_id = null;
        }
        dispatch('submit', rv);
    }
</script>

<form on:submit|preventDefault={save} class="space-y-4 max-w-2xl mx-auto">
    <div class="form-control">
        <label class="label" for="vin"><span class="label-text">VIN *</span></label>
        <input 
            bind:value={rv.vin} 
            id="vin" 
            type="text" 
            class="input input-bordered" 
            disabled={isEditing}
        />
    </div>
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div class="form-control">
            <label class="label" for="make"><span class="label-text">Make *</span></label>
            <input bind:value={rv.make} id="make" type="text" class="input input-bordered" />
        </div>
        <div class="form-control">
            <label class="label" for="model"><span class="label-text">Model *</span></label>
            <input bind:value={rv.model} id="model" type="text" class="input input-bordered" />
        </div>
        <div class="form-control">
            <label class="label" for="year"><span class="label-text">Year *</span></label>
            <input bind:value={rv.year} id="year" type="number" class="input input-bordered" />
        </div>
         <div class="form-control">
            <label class="label" for="mileage"><span class="label-text">Mileage *</span></label>
            <input bind:value={rv.mileage} id="mileage" type="number" class="input input-bordered" />
        </div>
         <div class="form-control">
            <label class="label" for="price"><span class="label-text">Price *</span></label>
            <input bind:value={rv.price} id="price" type="number" step="0.01" class="input input-bordered" />
        </div>
        <div class="form-control">
            <label class="label" for="status"><span class="label-text">Status</span></label>
            <select bind:value={rv.status} id="status" class="select select-bordered">
                {#each statusOptions as status}
                    <option value={status}>{status}</option>
                {/each}
            </select>
        </div>
    </div>
    
    <div class="form-control">
        <label class="label" for="owner"><span class="label-text">Owner Assignment</span></label>
        <select bind:value={rv.owner_client_id} id="owner" class="select select-bordered">
            <option value={null}>Dealership (Unassigned)</option>
            {#each clients as client}
                <option value={client.id}>{client.first_name} {client.last_name}</option>
            {/each}
        </select>
    </div>

    <div class="form-control">
        <label class="label" for="description"><span class="label-text">Description</span></label>
        <textarea bind:value={rv.description} id="description" class="textarea textarea-bordered" rows="3"></textarea>
    </div>

    <div class="divider"></div>

    <div class="space-y-4">
        <MediaManager 
            mediaType="image"
            bucketName="rv_media"
            entityId={rv.vin}
            initialUrls={rv.image_uris}
            on:urlsChanged={(e) => rv.image_uris = e.detail}
        />
        <MediaManager 
            mediaType="video"
            bucketName="rv_media"
            entityId={rv.vin}
            initialUrls={rv.video_uris}
            on:urlsChanged={(e) => rv.video_uris = e.detail}
        />
    </div>

    <div class="flex justify-end mt-6">
        <button type="submit" class="btn btn-primary">Save RV</button>
    </div>
</form>