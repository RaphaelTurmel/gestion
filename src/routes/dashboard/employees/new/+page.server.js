import { supabaseAdmin } from '$lib/supabaseAdmin';
import { fail, redirect } from '@sveltejs/kit';

export const actions = {
    default: async ({ request }) => {
        const formData = await request.formData();
        const email = formData.get('email');
        const password = formData.get('password');
        const name = formData.get('name');
        const role = formData.get('role');
        const department = formData.get('department');
        const job_title = formData.get('job_title');
        const isActive = formData.get('is_active') === 'on';

        const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
            email: email,
            password: password,
            email_confirm: true,
            user_metadata: { full_name: name }
        });

        if (authError) {
            return fail(400, { error: `Authentication Error: ${authError.message}` });
        }
        
        const newUserId = authData.user.id;

        const { error: profileError } = await supabaseAdmin
            .from('employees')
            .update({
                name: name,
                email: email,
                department: department,
                role: role,
                job_title: job_title,
                is_active: isActive
            })
            .eq('id', newUserId);

        if (profileError) {
            return fail(500, { error: `Database Error: ${profileError.message}` });
        }

        throw redirect(303, '/dashboard/employees');
    }
};