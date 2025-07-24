import { supabaseAdmin } from '$lib/supabaseAdmin';
import { fail, redirect } from '@sveltejs/kit';

export async function load({ params }) {
    const { employeeId } = params;
    const { data, error } = await supabaseAdmin
        .from('employees')
        .select('*')
        .eq('id', employeeId)
        .single();
    
    if (error) {
        return { status: 404, error: 'Employee not found.' };
    }

    return {
        employee: data
    };
}

export const actions = {
    default: async ({ request, params }) => {
        const { employeeId } = params;
        const formData = await request.formData();
        
        const employeeData = {
            name: formData.get('name'),
            email: formData.get('email'),
            department: formData.get('department'),
            role: formData.get('role'),
            job_title: formData.get('job_title'),
            is_active: formData.get('is_active') === 'on'
        };

        const { error } = await supabaseAdmin
            .from('employees')
            .update(employeeData)
            .eq('id', employeeId);

        if (error) {
            return fail(500, { 
                error: `Database Error: ${error.message}`,
                ...employeeData,
                id: employeeId
            });
        }

        throw redirect(303, '/dashboard/employees');
    }
};