<script>
    import { onMount } from 'svelte';
    import { page } from '$app/stores';
    import { supabase } from '$lib/supabaseClient';
    import { goto } from '$app/navigation';
    import ClientForm from '../../ClientForm.svelte';

    let client = null;
    let loading = true;
    const clientId = $page.params.clientId;
    
    onMount(async () => {
        const { data, error } = await supabase
            .from('clients')
            .select('*')
            .eq('id', clientId)
            .single();
            
        if (data) {
            client = data;
        } else {
            console.error(error);
        }
        loading = false;
    });

    async function handleSubmit(event) {
        const updatedClient = event.detail;
        
        const { error } = await supabase
            .from('clients')
            .update(updatedClient)
            .eq('id', clientId);
            
        if (error) {
            alert('Error updating client: ' + error.message);
        } else {
            goto(`/dashboard/clients/${clientId}`);
        }
    }
</script>

<div class="p-4">
    <h1 class="text-2xl font-bold mb-4">Edit Client</h1>
    {#if loading}
        <p>Loading...</p>
    {:else if client}
        <ClientForm clientData={client} on:submit={handleSubmit}/>
    {:else}
        <p>Client not found.</p>
    {/if}
</div>