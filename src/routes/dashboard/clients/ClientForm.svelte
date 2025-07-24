<script>
    import { createEventDispatcher } from 'svelte';

    export let client = {
        first_name: '',
        last_name: '',
        email: '',
        cell_phone: '',
        address: ''
    };
    export let saving = false;

    const dispatch = createEventDispatcher();

    function handleSubmit() {
        dispatch('save', { client });
    }
</script>

<form on:submit|preventDefault={handleSubmit} class="space-y-4">
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div class="form-control">
            <label for="first_name" class="label">First Name</label>
            <input id="first_name" type="text" bind:value={client.first_name} class="input input-bordered" required />
        </div>
        <div class="form-control">
            <label for="last_name" class="label">Last Name</label>
            <input id="last_name" type="text" bind:value={client.last_name} class="input input-bordered" required />
        </div>
    </div>
    <div class="form-control">
        <label for="email" class="label">Email</label>
        <input id="email" type="email" bind:value={client.email} class="input input-bordered" />
    </div>
    <div class="form-control">
        <label for="cell_phone" class="label">Cell Phone</label>
        <input id="cell_phone" type="tel" bind:value={client.cell_phone} class="input input-bordered" />
    </div>
    <div class="form-control">
        <label for="address" class="label">Address</label>
        <textarea id="address" bind:value={client.address} class="textarea textarea-bordered"></textarea>
    </div>
    <div class="card-actions justify-end">
        <button type="submit" class="btn btn-primary" disabled={saving}>
            {#if saving}
                <span class="loading loading-spinner"></span>
            {/if}
            Save Client
        </button>
    </div>
</form>
