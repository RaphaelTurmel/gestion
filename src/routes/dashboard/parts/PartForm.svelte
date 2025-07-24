<script>
    import { createEventDispatcher } from 'svelte';
    
    export let partData = {};
    export let isEditing = false;
    
    const dispatch = createEventDispatcher();
    
    let part = {
        part_number: partData.part_number || '',
        description: partData.description || '',
        category: partData.category || '',
        supplier: partData.supplier || '',
        in_stock_quantity: partData.in_stock_quantity || 0,
        cost: partData.cost || 0,
        price: partData.price || 0,
    };
    
    function save() {
        if (!part.part_number || !part.description) {
            alert('Part Number and Description are required.');
            return;
        }
        dispatch('submit', part);
    }
</script>

<form on:submit|preventDefault={save} class="space-y-4 max-w-lg mx-auto">
    <div class="form-control">
        <label class="label" for="partNumber"><span class="label-text">Part Number *</span></label>
        <input bind:value={part.part_number} id="partNumber" type="text" class="input input-bordered" disabled={isEditing} />
    </div>
    <div class="form-control">
        <label class="label" for="description"><span class="label-text">Description *</span></label>
        <input bind:value={part.description} id="description" type="text" class="input input-bordered" />
    </div>
    <div class="form-control">
        <label class="label" for="category"><span class="label-text">Category</span></label>
        <input bind:value={part.category} id="category" type="text" class="input input-bordered" />
    </div>
    <div class="form-control">
        <label class="label" for="supplier"><span class="label-text">Supplier</span></label>
        <input bind:value={part.supplier} id="supplier" type="text" class="input input-bordered" />
    </div>
    <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div class="form-control">
            <label class="label" for="quantity"><span class="label-text">In Stock Quantity</span></label>
            <input bind:value={part.in_stock_quantity} id="quantity" type="number" class="input input-bordered" />
        </div>
        <div class="form-control">
            <label class="label" for="cost"><span class="label-text">Cost</span></label>
            <input bind:value={part.cost} id="cost" type="number" step="0.01" class="input input-bordered" />
        </div>
        <div class="form-control">
            <label class="label" for="price"><span class="label-text">Price</span></label>
            <input bind:value={part.price} id="price" type="number" step="0.01" class="input input-bordered" />
        </div>
    </div>

    <div class="flex justify-end mt-6">
        <button type="submit" class="btn btn-primary">Save Part</button>
    </div>
</form>