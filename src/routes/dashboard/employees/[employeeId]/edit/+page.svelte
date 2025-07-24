<script>
    import EmployeeForm from '../../EmployeeForm.svelte';
    export let data;
    export let form;
</script>

<div class="p-4">
    <h1 class="text-2xl font-bold mb-4">Edit Employee</h1>
    {#if data.employee}
        <!-- Pass server data to the form, but let the form handle its own state -->
        <EmployeeForm form={form || data.employee} isEditing={true} />
    {:else}
        <p class="text-error">{data.error || 'Employee not found.'}</p>
    {/if}
</div>