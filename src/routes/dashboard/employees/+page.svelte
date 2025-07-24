<script>
    import { onMount } from 'svelte';
    import { supabase } from '$lib/supabaseClient';
    import { goto } from '$app/navigation';

    let employees = [];
    let searchTerm = '';
    let loading = true;

    async function loadEmployees() {
        loading = true;
        let query = supabase.from('employees').select('*');
        
        if (searchTerm) {
             query = query.or(`name.ilike.%${searchTerm}%,id::text.ilike.%${searchTerm}%,department.ilike.%${searchTerm}%,job_title.ilike.%${searchTerm}%`);
        }
        
        const { data, error } = await query.order('name');

        if (error) {
            console.error('Error loading employees:', error);
            employees = [];
        } else {
            employees = data;
        }
        loading = false;
    }

    onMount(() => {
        loadEmployees();
    });
</script>

<div class="p-4">
    <div class="flex justify-between items-center mb-4">
        <h1 class="text-2xl font-bold">Employees</h1>
        <a href="/dashboard/employees/new" class="btn btn-primary">Add Employee</a>
    </div>

    <div class="form-control mb-4">
        <input
            type="text"
            placeholder="Search by name, department, title..."
            class="input input-bordered w-full"
            bind:value={searchTerm}
            on:input={loadEmployees}
        />
    </div>

    {#if loading}
        <div class="text-center p-8">
            <span class="loading loading-lg"></span>
        </div>
    {:else if employees.length === 0}
        <p class="text-center text-gray-500">No employees found.</p>
    {:else}
        <div class="overflow-x-auto">
            <table class="table w-full">
                <thead>
                    <tr>
                        <th>Name</th>
                        <th>Job Title</th>
                        <th>Department</th>
                        <th>Status</th>
                    </tr>
                </thead>
                <tbody>
                    {#each employees as employee (employee.id)}
                        <tr class="hover cursor-pointer" on:click={() => goto(`/dashboard/employees/${employee.id}/edit`)}>
                            <td>
                                <div class="font-bold">{employee.name}</div>
                                <div class="text-sm opacity-50">{employee.email}</div>
                            </td>
                            <td>{employee.job_title}</td>
                            <td>{employee.department}</td>
                            <td>
                                {#if employee.is_active}
                                    <span class="badge badge-success">Active</span>
                                {:else}
                                    <span class="badge badge-error">Inactive</span>
                                {/if}
                            </td>
                        </tr>
                    {/each}
                </tbody>
            </table>
        </div>
    {/if}
</div>