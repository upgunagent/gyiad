import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: Request) {
    try {
        const formData = await request.formData();
        const file = formData.get('file') as File;
        const userId = formData.get('userId') as string;

        if (!file || !userId) {
            return NextResponse.json({ error: 'File and userId are required' }, { status: 400 });
        }

        const fileExt = file.name.split('.').pop();
        const filePath = `${userId}/avatar.${fileExt}`;
        const buffer = await file.arrayBuffer();

        // 1. Upload using Admin client (bypasses RLS)
        const { error: uploadError } = await supabaseAdmin.storage
            .from('avatars')
            .upload(filePath, buffer, {
                contentType: file.type,
                upsert: true
            });

        if (uploadError) {
            console.error('Upload Error:', uploadError);
            throw uploadError;
        }

        // 2. Get Public URL
        const { data: { publicUrl } } = supabaseAdmin.storage
            .from('avatars')
            .getPublicUrl(filePath);

        return NextResponse.json({ publicUrl });

    } catch (error: any) {
        console.error('Avatar Upload API Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
