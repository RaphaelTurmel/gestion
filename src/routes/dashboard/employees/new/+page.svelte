<script>
    import EmployeeForm from '../EmployeeForm.svelte';
    export let form;
</script>

<div class="p-4">
    <h1 class="text-2xl font-bold mb-4">Add New Employee</h1>
    <EmployeeForm {form} />
</div>