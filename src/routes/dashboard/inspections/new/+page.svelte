<script>
    import InspectionForm from '../InspectionForm.svelte';
    import { supabase } from '$lib/supabaseClient';
    import { goto } from '$app/navigation';
    import { page } from '$app/stores';
    
    const vinFromUrl = $page.url.searchParams.get('vin');

    async function handleSubmit(event) {
        const { inspection, items } = event.detail;
        
        const { data: inspectionResult, error: inspectionError } = await supabase
            .from('inspections')
            .insert(inspection)
            .select()
            .single();
            
        if (inspectionError) {
            alert('Error creating inspection: ' + inspectionError.message);
            return;
        }

        if (items.length > 0) {
            const itemsToInsert = items.map(item => ({
                inspection_id: inspectionResult.id,
                defect_description: item.defect_description,
                location: item.location
            }));

            const { error: itemsError } = await supabase
                .from('inspection_items')
                .insert(itemsToInsert);

            if (itemsError) {
                alert('Inspection record saved, but failed to save items: ' + itemsError.message);
            }
        }
        
        goto(`/dashboard/inspections/${inspectionResult.id}`);
    }
</script>

<div class="p-4">
    <h1 class="text-2xl font-bold mb-4">Create New Inspection</h1>
    <InspectionForm 
        inspectionData={{ vin: vinFromUrl }}
        on:submit={handleSubmit} 
    />
</div>