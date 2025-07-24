<script>
    import { onMount } from 'svelte';
    import { page } from '$app/stores';
    import { supabase } from '$lib/supabaseClient';
    import { goto } from '$app/navigation';
    import PartForm from '../../PartForm.svelte';

    let part = null;
    let loading = true;
    const partNumber = $page.params.partNumber;
    
    onMount(async () => {
        const { data, error } = await supabase
            .from('parts')
            .select('*')
            .eq('part_number', partNumber)
            .single();
            
        if (data) {
            part = data;
        } else {
            console.error(error);
        }
        loading = false;
    });

    async function handleSubmit(event) {
        const updatedPart = event.detail;
        
        const { error } = await supabase
            .from('parts')
            .update(updatedPart)
            .eq('part_number', partNumber);
            
        if (error) {
            alert('Error updating part: ' + error.message);
        } else {
            goto(`/dashboard/parts`);
        }
    }
</script>

<div class="p-4">
    <h1 class="text-2xl font-bold mb-4">Edit Part</h1>
    {#if loading}
        <p>Loading...</p>
    {:else if part}
        <PartForm partData={part} on:submit={handleSubmit} isEditing={true}/>
    {:else}
        <p>Part not found.</p>
    {/if}
</div>