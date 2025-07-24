<script>
    import { page } from '$app/stores';
    import { onMount } from 'svelte';
    import { supabase } from '$lib/supabaseClient';
    import { goto } from '$app/navigation';
    import ClientForm from '../../ClientForm.svelte';

    let client = null;
    let saving = false;
    let errorMessage = '';
    let loading = true;

    async function loadClient() {
        const { data, error } = await supabase
            .from('clients')
            .select('*')
            .eq('id', $page.params.clientId)
            .single();

        if (error) {
            console.error('Error loading client:', error);
            errorMessage = error.message;
        } else {
            client = data;
        }
        loading = false;
    }

    async function handleSave(event) {
        saving = true;
        errorMessage = '';
        const { client: clientData } = event.detail;
        
        // Remove id from the update payload
        const { id, ...updateData } = clientData;

        const { error } = await supabase
            .from('clients')
            .update(updateData)
            .eq('id', $page.params.clientId);

        if (error) {
            console.error('Error updating client:', error);
            errorMessage = error.message;
        } else {
            goto(`/dashboard/clients/${$page.params.clientId}`);
        }
        saving = false;
    }

    onMount(loadClient);
</script>

<div class="p-4">
    <h1 class="text-2xl font-bold mb-4">Edit Client</h1>

    {#if loading}
        <div class="text-center p-8"><span class="loading loading-lg"></span></div>
    {:else if errorMessage}
        <div class="alert alert-error mb-4">
            <div>
                 <svg xmlns="http://www.w3.org/2000/svg" class="stroke-current flex-shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                <span>{errorMessage}</span>
            </div>
        </div>
    {/if}

    {#if client}
        <ClientForm {client} {saving} on:save={handleSave} />
    {/if}
</div>
