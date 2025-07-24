<script>
    import { onMount } from 'svelte';
    import { page } from '$app/stores';
    import { supabase } from '$lib/supabaseClient';
    import { goto } from '$app/navigation';
    import InspectionForm from '../../InspectionForm.svelte';

    let inspection = null;
    let items = [];
    let loading = true;
    const inspectionId = $page.params.inspectionId;
    
    onMount(async () => {
        const { data: inspectionData, error } = await supabase
            .from('inspections')
            .select('*')
            .eq('id', inspectionId)
            .single();
            
        if (inspectionData) {
            inspection = inspectionData;
            const { data: itemData } = await supabase
                .from('inspection_items')
                .select('*')
                .eq('inspection_id', inspectionId);
            if (itemData) items = itemData;
        } else {
            console.error(error);
        }
        loading = false;
    });

    async function handleSubmit(event) {
        const { inspection: updatedInspection, items: updatedItems } = event.detail;
        
        const { error: inspectionError } = await supabase
            .from('inspections')
            .update({
                title: updatedInspection.title,
                inspection_type: updatedInspection.inspection_type,
            })
            .eq('id', inspectionId);
            
        if (inspectionError) {
            alert('Error updating inspection: ' + inspectionError.message);
            return;
        }

        const { error: deleteError } = await supabase
            .from('inspection_items')
            .delete()
            .eq('inspection_id', inspectionId);

        if (deleteError) {
            alert('Error clearing old items: ' + deleteError.message);
            return;
        }
        
        if (updatedItems.length > 0) {
            const itemsToInsert = updatedItems.map(item => ({
                inspection_id: inspectionId,
                defect_description: item.defect_description,
                location: item.location,
            }));
            const { error: insertError } = await supabase
                .from('inspection_items')
                .insert(itemsToInsert);
            if (insertError) {
                alert('Error saving new items: ' + insertError.message);
                return;
            }
        }

        goto(`/dashboard/inspections/${inspectionId}`);
    }
</script>

<div class="p-4">
    <h1 class="text-2xl font-bold mb-4">Edit Inspection</h1>
    {#if loading}
        <p>Loading...</p>
    {:else if inspection}
        <InspectionForm 
            inspectionData={inspection} 
            itemsData={items} 
            on:submit={handleSubmit}
            isEditing={true}
        />
    {:else}
        <p>Inspection not found.</p>
    {/if}
</div>