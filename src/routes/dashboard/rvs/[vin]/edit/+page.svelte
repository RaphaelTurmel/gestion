<script>
    import { page } from '$app/stores';
    import { supabase } from '$lib/supabaseClient';
    import { goto } from '$app/navigation';
    import RVForm from '../../RVForm.svelte';

    export let data; // Data from +page.js

    async function handleSubmit(event) {
        const updatedRV = event.detail;
        
        const { error } = await supabase
            .from('rvs')
            .update(updatedRV)
            .eq('vin', data.rv.vin);
            
        if (error) {
            alert('Error updating RV: ' + error.message);
        } else {
            goto(`/dashboard/rvs/${data.rv.vin}`);
        }
    }
</script>

<div class="p-4">
    <h1 class="text-2xl font-bold mb-4">Edit RV</h1>
    {#if data.rv}
        <RVForm 
            rvData={data.rv} 
            clients={data.clients} 
            on:submit={handleSubmit} 
            isEditing={true}
        />
    {:else}
        <p>RV not found.</p>
    {/if}
</div>