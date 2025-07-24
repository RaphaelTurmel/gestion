<script>
    import { goto } from '$app/navigation';
    import { supabase } from '$lib/supabaseClient';
    import { user } from '$lib/stores.js';

    let email = '';
    let password = '';
    let loading = false;
    let errorMessage = '';

    const handleLogin = async () => {
        loading = true;
        errorMessage = '';
        try {
            const { data, error } = await supabase.auth.signInWithPassword({
                email: email,
                password: password,
            });

            if (error) throw error;
            
            user.set(data.user);
            goto('/dashboard');

        } catch (error) {
            errorMessage = error.message;
        } finally {
            loading = false;
        }
    };
</script>

<div class="hero min-h-screen bg-base-200">
    <div class="hero-content flex-col lg:flex-row-reverse">
        <div class="text-center lg:text-left">
            <h1 class="text-5xl font-bold">Avant-Garde RV</h1>
            <p class="py-6">Dealership Management System</p>
        </div>
        <div class="card shrink-0 w-full max-w-sm shadow-2xl bg-base-100">
            <form class="card-body" on:submit|preventDefault={handleLogin}>
                <div class="form-control">
                    <label class="label" for="email">
                        <span class="label-text">Email</span>
                    </label>
                    <input bind:value={email} type="email" id="email" placeholder="email" class="input input-bordered" required />
                </div>
                <div class="form-control">
                    <label class="label" for="password">
                        <span class="label-text">Password</span>
                    </label>
                    <input bind:value={password} type="password" id="password" placeholder="password" class="input input-bordered" required />
                </div>
                {#if errorMessage}
                    <div class="alert alert-error text-sm">
                        <span>{errorMessage}</span>
                    </div>
                {/if}
                <div class="form-control mt-6">
                    <button class="btn btn-primary" type="submit" disabled={loading}>
                        {#if loading}
                            <span class="loading loading-spinner"></span>
                        {/if}
                        Login
                    </button>
                </div>
            </form>
        </div>
    </div>
</div>