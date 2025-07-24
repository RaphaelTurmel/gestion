<script>
    import { createEventDispatcher } from 'svelte';
    import { supabase } from '$lib/supabaseClient';
    import { v4 as uuidv4 } from 'uuid';
    import { mediaModal } from '$lib/stores';

    export let mediaType = 'image'; // 'image' or 'video'
    export let bucketName;
    export let entityId = null; 
    export let initialUrls = [];

    const dispatch = createEventDispatcher();

    let currentUrls = [...initialUrls];
    let uploading = false;
    let selectedUrls = new Set();
    let isSelectionMode = false;

    if (!entityId) {
        entityId = uuidv4();
        dispatch('entityIdGenerated', entityId);
    }

    const fileInputAccept = mediaType === 'image' ? 'image/*' : 'video/*';
    const mediaLabel = mediaType.charAt(0).toUpperCase() + mediaType.slice(1);
    const entityTypeLabel = bucketName.includes('rv') ? 'VIN' : 'ID';

    function openModal(url) {
        mediaModal.set({ isOpen: true, url, mediaType });
    }

    async function handleFileUpload(event) {
        if (!entityId) {
            alert(`Please provide a main identifier (e.g., ${entityTypeLabel}) before adding media.`);
            return;
        }
        
        const files = event.target.files;
        if (!files || files.length === 0) return;
        uploading = true;
        
        for (const file of files) {
            const filePath = `${entityId}/${Date.now()}-${file.name}`;
            const { error } = await supabase.storage.from(bucketName).upload(filePath, file);

            if (error) {
                alert(`Error uploading ${file.name}: ${error.message}`);
                continue;
            }

            const { data } = supabase.storage.from(bucketName).getPublicUrl(filePath);
            currentUrls = [...currentUrls, data.publicUrl];
        }

        uploading = false;
        dispatch('urlsChanged', currentUrls);
    }

    function toggleSelection(url) {
        if (selectedUrls.has(url)) {
            selectedUrls.delete(url);
        } else {
            selectedUrls.add(url);
        }
        selectedUrls = selectedUrls;
    }

    function toggleSelectAll() {
        if (selectedUrls.size === currentUrls.length) {
            selectedUrls.clear();
        } else {
            selectedUrls = new Set(currentUrls);
        }
    }

    async function handleBatchRemove() {
        if (selectedUrls.size === 0) return;
        if (!confirm(`Are you sure you want to delete ${selectedUrls.size} selected item(s)?`)) return;

        try {
            const filePaths = Array.from(selectedUrls).map(url => 
                url.substring(url.indexOf(`/${bucketName}/`) + bucketName.length + 2)
            );

            const { error } = await supabase.storage.from(bucketName).remove(filePaths);
            
            if (error) throw error;

            currentUrls = currentUrls.filter(url => !selectedUrls.has(url));
            selectedUrls.clear();
            isSelectionMode = false;
            dispatch('urlsChanged', currentUrls);
            
        } catch (error) {
            alert(`Failed to delete items: ${error.message}`);
        }
    }
</script>

<div class="space-y-2">
    <div class="flex justify-between items-center">
        <h3 class="font-bold">{mediaLabel}s</h3>
        <div class="flex items-center gap-2">
            {#if isSelectionMode}
                <button type="button" class="btn btn-xs btn-ghost" on:click={toggleSelectAll}>
                    {selectedUrls.size === currentUrls.length ? 'Deselect All' : 'Select All'}
                </button>
                <button type="button" class="btn btn-xs btn-error" on:click={handleBatchRemove} disabled={selectedUrls.size === 0}>
                    Delete ({selectedUrls.size})
                </button>
                <button type="button" class="btn btn-xs btn-ghost" on:click={() => { isSelectionMode = false; selectedUrls.clear(); }}>Cancel</button>
            {:else}
                <button type="button" class="btn btn-xs btn-ghost" on:click={() => isSelectionMode = true} disabled={currentUrls.length === 0}>Select</button>
                <div class="tooltip" data-tip={!entityId ? `Please enter a ${entityTypeLabel} first` : `Add ${mediaLabel}s`}>
                    <label class="btn btn-sm btn-outline" class:btn-disabled={!entityId}>
                        {#if uploading}
                            <span class="loading loading-spinner loading-xs"></span>
                        {:else}
                            Add
                        {/if}
                        <input 
                            type="file" 
                            accept={fileInputAccept} 
                            multiple 
                            class="hidden"
                            on:change={handleFileUpload}
                            disabled={uploading || !entityId}
                        />
                    </label>
                </div>
            {/if}
        </div>
    </div>

    {#if currentUrls.length > 0}
        <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
            {#each currentUrls as url (url)}
                <button 
                    type="button"
                    class="relative group aspect-square cursor-pointer focus:outline-none"
                    on:click={() => { if (isSelectionMode) toggleSelection(url); else openModal(url); }}
                    class:ring={selectedUrls.has(url)}
                    class:ring-primary={selectedUrls.has(url)}
                    aria-label="Select or view media item"
                >
                    {#if mediaType === 'image'}
                        <img src={url} alt="{mediaLabel}" class="w-full h-full object-cover rounded-md bg-base-300" />
                    {:else if mediaType === 'video'}
                        <div class="w-full h-full rounded-md bg-black flex items-center justify-center">
                             <svg xmlns="http://www.w3.org/2000/svg" class="h-10 w-10 text-white opacity-50" viewBox="0 0 20 20" fill="currentColor">
                                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clip-rule="evenodd" />
                            </svg>
                        </div>
                    {/if}
                    {#if selectedUrls.has(url)}
                        <div class="absolute inset-0 bg-primary bg-opacity-50 flex items-center justify-center rounded-md">
                            <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8 text-white" viewBox="0 0 20 20" fill="currentColor">
                                <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
                            </svg>
                        </div>
                    {/if}
                </button>
            {/each}
        </div>
    {:else}
        <p class="text-sm text-gray-500 italic">No {mediaType}s added.</p>
    {/if}
</div>