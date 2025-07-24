<script>
    export let form;

    let id = form?.id ?? '';
    let name = form?.name ?? '';
    let email = form?.email ?? '';
    let department = form?.department ?? 'Service et Réparations';
    let job_title = form?.job_title ?? 'Technicien de VR';
    let role = form?.role ?? 'technician';
    let isActive = form?.is_active ?? true;
    let password = '';

    export let isEditing = false;

    const departmentsAndTitles = {
        'Direction': ['Propriétaire', 'Diréction générale'],
        'Ventes': ['Départements des ventes', 'Directeur des ventes', 'Conseiller en ventes', 'Directeur commercial', 'Adjoint administratif'],
        'Finance': ['Contrôleur financier'],
        'Service et Réparations': ['Directeur du service', 'Conseiller technique', 'Technicien de VR', 'Aviseur technique', 'Commis aux garanties'],
        'Pièces et Accessoires': ['Directeur des pièces', 'Commis aux pièces'],
        'Opérations': ['Département de la location', 'Livraison et préparation', 'Chauffeur-Livreur', 'Démonstrateur / Spécialiste de la livraison', 'Gestion de la cour / De l\'inventaire', 'Laveur / Préparateur de véhicules', 'Répartiteur'],
        'Administration': ['Administration', 'Commis Comptable', 'Ressources Humaines', 'Réceptionniste', 'Marketing et Communication'],
        'Propriétaire': ['Propriétaire']
    };

    let availableTitles = [];

    $: {
        availableTitles = departmentsAndTitles[department] || [];
        if (!availableTitles.includes(job_title)) {
            job_title = availableTitles[0] || '';
        }
    }
</script>

<form method="POST" class="space-y-4 max-w-lg mx-auto">
    {#if isEditing}
        <input type="hidden" name="id" value={id} />
    {/if}

    <div class="form-control">
        <label class="label" for="name"><span class="label-text">Full Name *</span></label>
        <input name="name" bind:value={name} id="name" type="text" class="input input-bordered" required />
    </div>

    <div class="form-control">
        <label class="label" for="email"><span class="label-text">Email Address *</span></label>
        <input name="email" bind:value={email} id="email" type="email" class="input input-bordered" required disabled={isEditing} />
    </div>

    {#if !isEditing}
        <div class="form-control">
            <label class="label" for="password"><span class="label-text">Password *</span></label>
            <input name="password" bind:value={password} id="password" type="password" class="input input-bordered" required />
        </div>
    {/if}

    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div class="form-control">
            <label class="label" for="department"><span class="label-text">Department *</span></label>
            <select name="department" bind:value={department} id="department" class="select select-bordered" required>
                {#each Object.keys(departmentsAndTitles) as dept}
                    <option value={dept}>{dept}</option>
                {/each}
            </select>
        </div>
        <div class="form-control">
            <label class="label" for="job_title"><span class="label-text">Job Title *</span></label>
            <select name="job_title" bind:value={job_title} id="job_title" class="select select-bordered" required>
                {#each availableTitles as title}
                    <option value={title}>{title}</option>
                {/each}
            </select>
        </div>
        <div class="form-control">
            <label class="label" for="role"><span class="label-text">Permission Role *</span></label>
            <select name="role" bind:value={role} id="role" class="select select-bordered" required>
                <option value="technician">Technician</option>
                <option value="sales">Sales</option>
                <option value="admin">Admin</option>
            </select>
        </div>
    </div>
    
    <div class="form-control">
        <label class="label cursor-pointer">
            <span class="label-text">Is Active</span> 
            <input type="checkbox" name="is_active" bind:checked={isActive} class="toggle toggle-primary" />
        </label>
    </div>

    {#if form?.error}
        <div class="alert alert-error">
            <span>{form.error}</span>
        </div>
    {/if}

    <div class="flex justify-end mt-6">
        <button type="submit" class="btn btn-primary">
            {#if isEditing}Save Changes{:else}Create Employee{/if}
        </button>
    </div>
</form>