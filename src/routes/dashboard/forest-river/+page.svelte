<script>
    import VinSearch from './VinSearch.svelte';
    import ClaimStatus from './ClaimStatus.svelte';
</script>

<div class="p-4 space-y-8">
    <div>
        <h1 class="text-3xl font-bold mb-4">Forest River API</h1>
        <p class="text-gray-600">Tools for interacting with the Forest River Dealer Connect API.</p>
    </div>

    <div class="divider"></div>

    <!-- VIN Search Component -->
    <VinSearch />

    <div class="divider"></div>

    <!-- Claim Status Component -->
    <ClaimStatus />

</div>