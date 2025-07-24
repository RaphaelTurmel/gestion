<script>
    import { createEventDispatcher, onMount } from 'svelte';
    import { supabase } from '$lib/supabaseClient';

    export let workOrderData = {};
    export let itemsData = [];
    export let isEditing = false;

    const dispatch = createEventDispatcher();
    
    let rvs = [];
    let clients = [];
    
    let workOrder = {
        vin: workOrderData.vin || '',
        title: workOrderData.title || '',
        client_id: workOrderData.client_id || null,
    };
    let items = [...itemsData.map(item => ({...item}))];

    onMount(async () => {
        // Fetch all necessary data upfront
        const { data: rvData } = await supabase.from('rvs').select('vin, year, make, model, owner_client_id').order('year', { ascending: false });
        if (rvData) rvs = rvData;
        
        const { data: clientData } = await supabase.from('clients').select('id, first_name, last_name').order('last_name');
        if (clientData) clients = clientData;
    });

    const statusOptions = ['PENDING', 'IN_PROGRESS', 'BLOCKED', 'COMPLETED'];

    // --- THE CRITICAL FIX: Dependent Dropdown Logic ---
    function handleVinChange() {
        const selectedRv = rvs.find(rv => rv.vin === workOrder.vin);
        // If the selected RV has an owner, auto-select that client.
        if (selectedRv && selectedRv.owner_client_id) {
            workOrder.client_id = selectedRv.owner_client_id;
        }
    }

    function handleClientChange() {
        if (!workOrder.client_id) return; // Do nothing if "Unassigned" is selected
        
        // Find all RVs owned by the selected client
        const clientRvs = rvs.filter(rv => rv.owner_client_id === workOrder.client_id);
        
        // If the client owns exactly one RV, auto-select it.
        if (clientRvs.length === 1) {
            workOrder.vin = clientRvs[0].vin;
        }
    }
    // --- End of Fix ---

    function addItem() {
        items = [...items, { id: `new-${Date.now()}`, description: '', technician: '', notes: '', status: 'PENDING' }];
    }

    function removeItem(index) {
        items.splice(index, 1);
        items = items;
    }

    function save() {
        if (!workOrder.vin || !workOrder.title) {
            alert('RV (VIN) and Work Order Title are required.');
            return;
        }
        if (workOrder.client_id === 'null' || workOrder.client_id === '') {
            workOrder.client_id = null;
        }
        dispatch('submit', { workOrder, items });
    }
</script>

<form on:submit|preventDefault={save} class="space-y-4 max-w-2xl mx-auto">
    <div class="form-control">
        <label class="label" for="rvVin"><span class="label-text">Select RV (by VIN) *</span></label>
        <select bind:value={workOrder.vin} on:change={handleVinChange} id="rvVin" class="select select-bordered" disabled={isEditing}>
            <option value="" disabled>Select an RV</option>
            {#each rvs as rv}
                <option value={rv.vin}>{rv.year} {rv.make} {rv.model} - ({rv.vin})</option>
            {/each}
        </select>
    </div>
    
    <div class="form-control">
        <label class="label" for="client"><span class="label-text">Assign to Client</span></label>
        <select bind:value={workOrder.client_id} on:change={handleClientChange} id="client" class="select select-bordered">
            <option value={null}>Unassigned</option>
            {#each clients as client}
                <option value={client.id}>{client.first_name} {client.last_name}</option>
            {/each}
        </select>
    </div>

    <div class="form-control">
        <label class="label" for="title"><span class="label-text">Work Order Title *</span></label>
        <input bind:value={workOrder.title} id="title" type="text" class="input input-bordered" />
    </div>
    
    <div class="divider"></div>
    
    <div class="flex justify-between items-center">
        <h2 class="text-lg font-bold">Tasks</h2>
        <button type="button" class="btn btn-sm btn-secondary" on:click={addItem}>Add Task</button>
    </div>
    
    <div class="space-y-2">
        {#each items as item, i (item.id)}
            <div class="p-2 border rounded-lg">
                <div class="form-control">
                    <label class="label text-sm" for="task-desc-{i}"><span class="label-text">Description</span></label>
                    <textarea bind:value={item.description} id="task-desc-{i}" class="textarea textarea-bordered textarea-sm" rows="2"></textarea>
                </div>
                 <div class="grid grid-cols-2 gap-4 mt-2">
                     <div class="form-control">
                        <label class="label text-sm" for="task-tech-{i}"><span class="label-text">Technician</span></label>
                        <input bind:value={item.technician} id="task-tech-{i}" type="text" class="input input-bordered input-sm" />
                    </div>
                     <div class="form-control">
                        <label class="label text-sm" for="task-status-{i}"><span class="label-text">Status</span></label>
                        <select bind:value={item.status} id="task-status-{i}" class="select select-bordered select-sm">
                            {#each statusOptions as status}
                                <option value={status}>{status}</option>
                            {/each}
                        </select>
                    </div>
                 </div>
                 <div class="form-control mt-2">
                    <label class="label text-sm" for="task-notes-{i}"><span class="label-text">Notes</span></label>
                    <input bind:value={item.notes} id="task-notes-{i}" type="text" class="input input-bordered input-sm" />
                </div>
                 <div class="text-right">
                     <button type="button" class="btn btn-xs btn-ghost text-error" on:click={() => removeItem(i)}>Remove</button>
                 </div>
            </div>
        {/each}
    </div>

    <div class="flex justify-end mt-6">
        <button type="submit" class="btn btn-primary">Save Work Order</button>
    </div>
</form>