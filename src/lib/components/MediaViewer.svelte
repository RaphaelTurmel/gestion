<script>
    import { mediaModal } from '$lib/stores';

    export let title = 'Media';
    export let mediaType = 'image'; // 'image' or 'video'
    export let urls = [];

    function openModal(url) {
        mediaModal.set({ isOpen: true, url, mediaType });
    }
</script>

{#if urls && urls.length > 0}
    <div class="mt-4">
        <h3 class="font-bold text-lg">{title}</h3>
        <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 mt-2">
            {#each urls as url (url)}
                <button 
                    type="button"
                    class="relative group aspect-square cursor-pointer focus:outline-none"
                    on:click={() => openModal(url)}
                    aria-label="View media item"
                >
                    {#if mediaType === 'image'}
                        <img src={url} alt="{title} content" class="w-full h-full object-cover rounded-md bg-base-300" />
                    {:else if mediaType === 'video'}
                        <div class="w-full h-full rounded-md bg-black flex items-center justify-center">
                             <svg xmlns="http://www.w3.org/2000/svg" class="h-10 w-10 text-white opacity-50" viewBox="0 0 20 20" fill="currentColor">
                                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clip-rule="evenodd" />
                            </svg>
                        </div>
                    {/if}
                </button>
            {/each}
        </div>
    </div>
{:else}
    <div class="mt-4">
        <h3 class="font-bold text-lg">{title}</h3>
        <p class="text-sm text-gray-500 italic mt-2">No {mediaType}s available.</p>
    </div>
{/if}