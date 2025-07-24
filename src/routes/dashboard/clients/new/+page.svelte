<script>
    import { goto } from '$app/navigation';
    import { supabase } from '$lib/supabaseClient';
    import ClientForm from '../ClientForm.svelte';

    let client = {
        first_name: '',
        last_name: '',
        email: '',
        cell_phone: '',
        address: ''
    };
    let saving = false;
    let errorMessage = '';

    async function handleSave(event) {
        saving = true;
        errorMessage = '';
        const { client: clientData } = event.detail;

        const { data, error } = await supabase
            .from('clients')
            .insert([clientData])
            .select()
            .single();

        if (error) {
            console.error('Error creating client:', error);
            errorMessage = error.message;
        } else {
            goto(`/dashboard/clients/${data.id}`);
        }
        saving = false;
    }
</script>

<div class="p-4">
    <h1 class="text-2xl font-bold mb-4">Add New Client</h1>

    {#if errorMessage}
        <div class="alert alert-error mb-4">
            <div>
                <svg xmlns="http://www.w3.org/2000/svg" class="stroke-current flex-shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                <span>{errorMessage}</span>
            </div>
        </div>
    {/if}

    <ClientForm {client} {saving} on:save={handleSave} />
</div>
