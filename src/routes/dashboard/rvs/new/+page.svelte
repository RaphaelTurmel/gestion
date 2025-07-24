<script>
    import RVForm from '../RVForm.svelte';
    import { supabase } from '$lib/supabaseClient';
    import { goto } from '$app/navigation';

    export let data; // Data from +page.js
    
    async function handleSubmit(event) {
        const newRV = event.detail;
        
        const { data, error } = await supabase
            .from('rvs')
            .insert(newRV)
            .select()
            .single();
            
        if (error) {
            alert('Error creating RV: ' + error.message);
        } else {
            goto(`/dashboard/rvs/${data.vin}`);
        }
    }
</script>

<div class="p-4">
    <h1 class="text-2xl font-bold mb-4">Add New RV</h1>
    <RVForm clients={data.clients} on:submit={handleSubmit} />
</div>