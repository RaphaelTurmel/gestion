<script>
    import PartForm from '../PartForm.svelte';
    import { supabase } from '$lib/supabaseClient';
    import { goto } from '$app/navigation';
    
    async function handleSubmit(event) {
        const newPart = event.detail;
        
        const { error } = await supabase
            .from('parts')
            .insert(newPart);
            
        if (error) {
            alert('Error creating part: ' + error.message);
        } else {
            goto(`/dashboard/parts`);
        }
    }
</script>

<div class="p-4">
    <h1 class="text-2xl font-bold mb-4">Add New Part</h1>
    <PartForm on:submit={handleSubmit} />
</div>