<script>
    import { createEventDispatcher } from 'svelte';
    
    export let clientData = {};
    
    const dispatch = createEventDispatcher();
    
    let client = {
        first_name: clientData.first_name || '',
        last_name: clientData.last_name || '',
        cell_phone: clientData.cell_phone || '',
        landline_phone: clientData.landline_phone || '',
        email: clientData.email || '',
        address_street: clientData.address_street || '',
        address_city: clientData.address_city || '',
        address_state: clientData.address_state || '',
        address_zip: clientData.address_zip || '',
    };
    
    function save() {
        // Simple validation
        if (!client.first_name || !client.last_name || !client.cell_phone) {
            alert('First Name, Last Name, and Cell Phone are required.');
            return;
        }
        dispatch('submit', client);
    }
</script>

<form on:submit|preventDefault={save} class="space-y-4">
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div class="form-control">
            <label class="label" for="firstName">
                <span class="label-text">First Name *</span>
            </label>
            <input bind:value={client.first_name} id="firstName" type="text" class="input input-bordered" />
        </div>
        <div class="form-control">
            <label class="label" for="lastName">
                <span class="label-text">Last Name *</span>
            </label>
            <input bind:value={client.last_name} id="lastName" type="text" class="input input-bordered" />
        </div>
        <div class="form-control">
            <label class="label" for="cellPhone">
                <span class="label-text">Cell Phone *</span>
            </label>
            <input bind:value={client.cell_phone} id="cellPhone" type="tel" class="input input-bordered" />
        </div>
        <div class="form-control">
            <label class="label" for="landline">
                <span class="label-text">Landline</span>
            </label>
            <input bind:value={client.landline_phone} id="landline" type="tel" class="input input-bordered" />
        </div>
        <div class="form-control md:col-span-2">
            <label class="label" for="email">
                <span class="label-text">Email</span>
            </label>
            <input bind:value={client.email} id="email" type="email" class="input input-bordered" />
        </div>
    </div>
    
    <div class="divider">Address</div>
    
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
         <div class="form-control md:col-span-2">
            <label class="label" for="street">
                <span class="label-text">Street Address</span>
            </label>
            <input bind:value={client.address_street} id="street" type="text" class="input input-bordered" />
        </div>
        <div class="form-control">
            <label class="label" for="city">
                <span class="label-text">City</span>
            </label>
            <input bind:value={client.address_city} id="city" type="text" class="input input-bordered" />
        </div>
        <div class="form-control">
            <label class="label" for="state">
                <span class="label-text">State / Province</span>
            </label>
            <input bind:value={client.address_state} id="state" type="text" class="input input-bordered" />
        </div>
        <div class="form-control">
            <label class="label" for="zip">
                <span class="label-text">ZIP / Postal Code</span>
            </label>
            <input bind:value={client.address_zip} id="zip" type="text" class="input input-bordered" />
        </div>
    </div>
    
    <div class="flex justify-end mt-6">
        <button type="submit" class="btn btn-primary">Save Client</button>
    </div>
</form>