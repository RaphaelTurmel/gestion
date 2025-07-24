<script>
    import { onMount } from 'svelte';
    import { goto } from '$app/navigation';
    import { supabase } from '$lib/supabaseClient';
    import { user, employeeProfile, mediaModal } from '$lib/stores.js';
    import { page } from '$app/stores';
    import MediaModal from '$lib/components/MediaModal.svelte';

    let sidebarOpen = false;

    onMount(() => {
        const { data } = supabase.auth.onAuthStateChange((event, session) => {
            user.set(session?.user ?? null);
            if (!session) {
                employeeProfile.set(null);
                goto('/');
            } else if ($user?.id !== session.user.id) {
                fetchEmployeeProfile(session.user.id);
            }
        });

        supabase.auth.getSession().then(({ data: { session } }) => {
            if (!session) {
                goto('/');
            } else {
                user.set(session.user);
                if (!$employeeProfile) {
                    fetchEmployeeProfile(session.user.id);
                }
            }
        });

        return () => data.subscription.unsubscribe();
    });

    const fetchEmployeeProfile = async (userId) => {
        const { data, error } = await supabase
            .from('employees')
            .select('*')
            .eq('id', userId)
            .single();

        if (data) {
            employeeProfile.set(data);
        } else {
            console.error('Error fetching employee profile:', error);
            alert('Could not retrieve your employee profile. Please contact an administrator.');
            await supabase.auth.signOut();
        }
    };

    const handleLogout = async () => {
        await supabase.auth.signOut();
        employeeProfile.set(null);
        user.set(null);
        goto('/');
    };

    $: employee = $employeeProfile;
</script>

{#if $mediaModal.isOpen}
    <MediaModal />
{/if}

<div class="drawer lg:drawer-open">
    <input id="my-drawer" type="checkbox" class="drawer-toggle" bind:checked={sidebarOpen} />
    <div class="drawer-content flex flex-col items-center justify-center bg-base-100">
        <div class="navbar bg-base-200 lg:hidden">
            <div class="flex-none">
                <label for="my-drawer" class="btn btn-square btn-ghost">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" class="inline-block w-5 h-5 stroke-current"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"></path></svg>
                </label>
            </div>
            <div class="flex-1">
                <a class="btn btn-ghost text-xl" href="/dashboard">Avant-Garde RV</a>
            </div>
        </div>
        <div class="w-full h-full overflow-y-auto p-4">
             <slot />
        </div>
    </div>
    <div class="drawer-side">
        <label for="my-drawer" aria-label="close sidebar" class="drawer-overlay"></label>
        <ul class="menu p-4 w-80 min-h-full bg-base-200 text-base-content flex flex-col">
            <li class="text-xl font-bold p-4">
                <a href="/dashboard">Avant-Garde RV</a>
            </li>

            {#if employee}
            <div class="flex-grow">
                <li>
                    <a href="/dashboard/rvs" class:active={$page.url.pathname.startsWith('/dashboard/rvs')} on:click={() => sidebarOpen = false}>RV Inventory</a>
                </li>
                <li>
                    <a href="/dashboard/inspections" class:active={$page.url.pathname.startsWith('/dashboard/inspections')} on:click={() => sidebarOpen = false}>Inspections</a>
                </li>
                <li>
                    <a href="/dashboard/work-orders" class:active={$page.url.pathname.startsWith('/dashboard/work-orders')} on:click={() => sidebarOpen = false}>Work Orders</a>
                </li>
                
                {#if employee.role === 'admin' || employee.role === 'sales' || employee.role === 'technician'}
                <li>
                    <a href="/dashboard/clients" class:active={$page.url.pathname.startsWith('/dashboard/clients')} on:click={() => sidebarOpen = false}>Clients</a>
                </li>
                {/if}

                {#if employee.role === 'admin' || employee.role === 'technician'}
                <li>
                    <a href="/dashboard/parts" class:active={$page.url.pathname.startsWith('/dashboard/parts')} on:click={() => sidebarOpen = false}>Parts</a>
                </li>
                <li>
                    <a href="/dashboard/forest-river" class:active={$page.url.pathname.startsWith('/dashboard/forest-river')} on:click={() => sidebarOpen = false}>Forest River</a>
                </li>
                {/if}

                {#if employee.role === 'admin'}
                <li>
                    <a href="/dashboard/employees" class:active={$page.url.pathname.startsWith('/dashboard/employees')} on:click={() => sidebarOpen = false}>Employees</a>
                </li>
                {/if}
            </div>
            
            <div class="p-4 border-t border-base-300">
                <p class="font-bold">{employee.name}</p>
                <p class="text-sm capitalize text-gray-500">{employee.role}</p>
            </div>
            <li>
                <button class="btn btn-ghost" on:click={handleLogout}>Logout</button>
            </li>
            {:else}
             <li class="mt-auto mx-auto">
                 <span class="loading loading-lg"></span>
             </li>
            {/if}
        </ul>
    </div>
</div>