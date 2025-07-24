<script>
    import { searchVinDetails } from '$lib/forestRiverApi.js';
    let vin = '';
    let result = null;
    let loading = false;
    let errorMessage = '';

    async function handleSearch() {
        if (!vin) return;
        loading = true;
        errorMessage = '';
        result = null;
        try {
            const data = await searchVinDetails(vin.trim().toUpperCase());

            // THE CRITICAL FIX: The Edge function returns an array of results.
            // We need to check if the array is not empty and then take the first element.
            if (Array.isArray(data) && data.length > 0) {
                result = data[0];
            } else {
                errorMessage = "No details found for this VIN.";
            }
        } catch (error) {
            errorMessage = `Error: ${error.message}`;
        } finally {
            loading = false;
        }
    }

    function formatDate(dateString) {
        if (!dateString) return 'N/A';
        try {
            return new Date(dateString).toLocaleDateString();
        } catch (e) {
            return 'Invalid Date';
        }
    }
</script>

<div class="space-y-4">
    <h2 class="text-2xl font-bold">VIN Search</h2>
    <form class="flex items-center gap-2" on:submit|preventDefault={handleSearch}>
        <input 
            type="text" 
            placeholder="Enter 17-digit VIN" 
            class="input input-bordered w-full max-w-xs"
            bind:value={vin}
        />
        <button class="btn btn-primary" type="submit" disabled={loading}>
            {#if loading} <span class="loading loading-spinner"></span> {/if}
            Search
        </button>
    </form>

    {#if errorMessage}
        <div class="alert alert-error">
            <span>{errorMessage}</span>
        </div>
    {/if}

    {#if result}
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-4">
            <!-- Vehicle & Warranty Column -->
            <div class="space-y-6">
                <div class="card bg-base-200 shadow-md">
                    <div class="card-body">
                        <h3 class="card-title">{result.ModelYear} {result.MakeDescription} {result.SubBrandDescription}</h3>
                        <p><strong>VIN:</strong> {result.VIN}</p>
                        <p><strong>Brand:</strong> {result.BrandDescription}</p>
                        <p><strong>Color:</strong> {result.ExteriorColor}</p>
                    </div>
                </div>
                <div class="card bg-base-200 shadow-md">
                    <div class="card-body">
                        <h3 class="card-title">Warranty Information</h3>
                        <p><strong>Type:</strong> {result.WarrantyType}</p>
                        <p><strong>Start Date:</strong> {formatDate(result.WarrantyStart)}</p>
                        <p><strong>End Date:</strong> {formatDate(result.WarrantyEnd)}</p>
                        <p><strong>Retail Sold Date:</strong> {formatDate(result.RetailSoldDate)}</p>
                    </div>
                </div>
                <div class="card bg-base-200 shadow-md">
                    <div class="card-body">
                        <h3 class="card-title">Status Flags</h3>
                        <div class="flex flex-wrap gap-2">
                            <div class="badge {result.IsRetailSold ? 'badge-success' : 'badge-ghost'}">Retail Sold: {result.IsRetailSold ? 'Yes' : 'No'}</div>
                            <div class="badge {result.HasCampaigns ? 'badge-warning' : 'badge-ghost'}">Campaigns: {result.HasCampaigns ? 'Yes' : 'No'}</div>
                            <div class="badge {result.HasIssues ? 'badge-warning' : 'badge-ghost'}">Issues: {result.HasIssues ? 'Yes' : 'No'}</div>
                            <div class="badge {result.IsMotorized ? 'badge-info' : 'badge-ghost'}">Motorized: {result.IsMotorized ? 'Yes' : 'No'}</div>
                             <div class="badge {result.IsRentalUnit ? 'badge-info' : 'badge-ghost'}">Rental Unit: {result.IsRentalUnit ? 'Yes' : 'No'}</div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Owner & Dealer Column -->
            <div class="space-y-6">
                <div class="card bg-base-300 shadow-md">
                    <div class="card-body">
                        <h3 class="card-title">Owner Details</h3>
                        <p class="font-bold">{result.Owner || 'N/A'}</p>
                        {#if result.OwnerAddress}
                            <pre class="text-sm font-sans whitespace-pre-wrap">{result.OwnerAddress}</pre>
                        {/if}
                    </div>
                </div>
                <div class="card bg-base-300 shadow-md">
                    <div class="card-body">
                        <h3 class="card-title">Dealer Details</h3>
                        <p class="font-bold">{result.DealerName || 'N/A'}</p>
                        {#if result.DealerAddress}
                            <pre class="text-sm font-sans whitespace-pre-wrap">{result.DealerAddress}</pre>
                        {/if}
                    </div>
                </div>
                 <div class="card bg-base-300 shadow-md">
                    <div class="card-body">
                        <h3 class="card-title">Manufacturing IDs</h3>
                        <p><strong>Production Order:</strong> {result.ProductionOrder || 'N/A'}</p>
                        <p><strong>Sales ID:</strong> {result.SalesId || 'N/A'}</p>
                        <p><strong>Item Number:</strong> {result.VINItemNumber || 'N/A'}</p>
                    </div>
                </div>
            </div>
        </div>
    {/if}
</div>