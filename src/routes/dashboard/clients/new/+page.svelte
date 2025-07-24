<script>
    import ClientForm from '../ClientForm.svelte';
    import { supabase } from '$lib/supabaseClient';
    import { goto } from '$app/navigation';
    
    async function handleSubmit(event) {
        const newClient = event.detail;
        
        const { data, error } = await supabase
            .from('clients')
            .insert(newClient)
            .select()
            .single();
            
        if (error) {
            alert('Error creating client: ' + error.message);
        } else {
            goto(`/dashboard/clients/${data.id}`);
        }
    }
</script>

<div class="p-4">
    <h1 class="text-2xl font-bold mb-4">Add New Client</h1>
    <ClientForm on:submit={handleSubmit} />
</div>