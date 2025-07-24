<script>
    // This is a placeholder for a future employee detail page.
    // For now, it redirects to an edit page.
    import { page } from '$app/stores';
    import { goto } from '$app/navigation';
    import { onMount } from 'svelte';
    
    onMount(() => {
        goto(`/dashboard/employees/${$page.params.employeeId}/edit`);
    });
</script>

<div class="p-4 text-center">
    <p>Redirecting to edit employee...</p>
    <span class="loading loading-lg"></span>
</div>