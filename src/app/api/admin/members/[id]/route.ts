import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

// Force Rebuild
const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Helper to await params for Next.js 15
async function getParams(params: Promise<{ id: string }> | { id: string }) {
    return await params;
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await getParams(params);
        const userId = id;
        console.log("Deleting member:", userId);

        const { error: memberError } = await supabaseAdmin
            .from('members')
            .delete()
            .eq('id', userId);

        if (memberError) {
            console.error("Error deleting member profile:", memberError);
        }

        const { error: authError } = await supabaseAdmin.auth.admin.deleteUser(userId);

        if (authError) {
            console.error("Error deleting auth user:", authError);
            return NextResponse.json({ error: authError.message }, { status: 500 });
        }

        return NextResponse.json({ success: true });
    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const body = await req.json();
        const { id } = await getParams(params);

        const { board_roles, membership_start_date, membership_status, ...profileUpdates } = body;

        // Sanitize date fields: Empty string -> null
        // Map membership_start_date -> membership_date
        // Map membership_status -> member_type
        const updates: any = {
            ...profileUpdates,
            board_roles: Array.isArray(board_roles) ? board_roles : [],
            birth_date: profileUpdates.birth_date === '' ? null : profileUpdates.birth_date,
            membership_date: (membership_start_date === '' ? null : membership_start_date) || (profileUpdates.membership_date === '' ? null : profileUpdates.membership_date),
            membership_end_date: profileUpdates.membership_end_date === '' ? null : profileUpdates.membership_end_date,
            company_turnover: profileUpdates.company_turnover || null,
            number_of_employees: profileUpdates.number_of_employees || null,
            member_type: membership_status // Map frontend status to DB field
        };

        // Remove the source field if it somehow leaked into profileUpdates (it was destructured out, so it shouldn't, but good to be safe logic-wise)

        const { error } = await supabaseAdmin
            .from('members')
            .update(updates)
            .eq('id', id);

        if (error) throw error;

        return NextResponse.json({ success: true });
    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await getParams(params);
        console.log("Fetching member:", id);

        const { data, error } = await supabaseAdmin
            .from('members')
            .select('*')
            .eq('id', id)
            .single();

        if (error) {
            console.error("Supabase Error:", error);
            if (error.code === 'PGRST116') {
                return NextResponse.json({ error: 'Member not found' }, { status: 404 });
            }
            throw error;
        }

        return NextResponse.json(data);
    } catch (e: any) {
        console.error("API Error:", e);
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}

