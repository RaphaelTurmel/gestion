<script>
    import { mediaModal } from '$lib/stores.js';

    function closeModal() {
        mediaModal.set({ isOpen: false, url: '', mediaType: 'image' });
    }

    function handleKeydown(event) {
        if (event.key === 'Escape') {
            closeModal();
        }
    }
</script>

<svelte:window on:keydown={handleKeydown}/>

<!-- svelte-ignore a11y-click-events-have-key-events -->
<div 
    class="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50 p-4" 
    on:click|self={closeModal}
    role="dialog"
    aria-modal="true"
>
    <div class="relative w-full h-full flex items-center justify-center">
        <!-- Close button -->
        <button on:click={closeModal} class="btn btn-circle btn-ghost absolute -top-2 -right-2 z-10 text-white bg-gray-800 hover:bg-gray-700">
            ✕
        </button>

        {#if $mediaModal.mediaType === 'image'}
            <img 
                src={$mediaModal.url} 
                alt="Enlarged media" 
                class="max-w-[90vw] max-h-[90vh] object-contain rounded-lg"
            >
        {:else if $mediaModal.mediaType === 'video'}
            <video 
                src={$mediaModal.url} 
                class="max-w-[90vw] max-h-[90vh] object-contain rounded-lg"
                controls 
                autoplay
            >
                <track kind="captions" />
            </video>
        {/if}
    </div>
</div>