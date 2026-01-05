import { createClient } from '@/lib/supabase/client';
import { Member } from '@/data/mock-members';

// Convert database snake_case to frontend camelCase if needed, 
// or just use snake_case throughout to match DB.
// For now, let's keep the frontend using the structure we built, 
// but we might need to map it if DB columns coincide.
// Based on schema: columns are snake_case (company_name, member_type etc.)
// Our mock data is also snake_case mostly (company_name, member_type).
// Just need to handle jsonb/arrays.

export type DbMember = {
    id: string;
    full_name: string;
    avatar_url: string;
    email: string;
    company_name: string;
    company_address?: string;
    sector: string;
    business_area?: string;
    position: string;
    websites: string[];
    birth_date: string;
    marital_status: 'single' | 'married';
    gender?: 'male' | 'female';
    education: {
        level: string;
        school: string;
        department: string;
        year?: string;
    }[]; // JSONB
    languages: string[];
    other_memberships: string;
    member_type: 'active' | 'honorary' | 'founder' | 'left';
    membership_date: string;
    membership_end_date: string | null;
    board_role?: string;
    board_roles?: string[];
    gyiad_projects?: string;
    company_turnover?: string;
    number_of_employees?: string;
    linkedin_url?: string;
    card_role?: string; // Explicit role for member card display
    is_admin?: boolean; // Added for filtering
    phone?: string; // Admin-only phone number
    kvkk_consent?: boolean;
    kvkk_consent_date?: string;
    // ... other fields
};

const supabase = createClient();

export const memberService = {

    async getCurrentUser() {
        const { data: { user }, error } = await supabase.auth.getUser();
        if (error || !user) return null;
        return user;
    },

    async getProfile(userId: string) {
        const { data, error } = await supabase
            .from('members')
            .select('*')
            .eq('id', userId)
            .single();

        if (error) {
            // PGRST116 is the code for "JSON object requested, multiple (or no) rows returned"
            // specifically when .single() is used and no row is found.
            if (error.code === 'PGRST116') {
                console.warn('Profile not found yet (PGRST116). User might be new.');
                return null;
            }

            console.error('Error fetching profile full details:', {
                code: error.code,
                message: error.message,
                details: error.details,
                hint: error.hint
            });
            return null;
        }
        return data as DbMember;
    },

    async getAllMembers() {
        const { data, error } = await supabase
            .from('members')
            .select('*')
            .order('full_name', { ascending: true });

        if (error) {
            console.error('Error fetching all members:', error);
            return [];
        }
        return data as DbMember[];
    },

    async updateProfile(userId: string, updates: Partial<DbMember>) {
        const { data, error } = await supabase
            .from('members')
            .update(updates)
            .eq('id', userId)
            .select() // Return updated data
            .single();

        if (error) {
            console.error('Error updating profile:', error);
            throw error;
        }
        return data;
    },

    async uploadAvatar(file: File, userId: string) {
        const fileExt = file.name.split('.').pop();
        const filePath = `${userId}/avatar.${fileExt}`;

        const { error: uploadError } = await supabase.storage
            .from('avatars')
            .upload(filePath, file, { upsert: true });

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
            .from('avatars')
            .getPublicUrl(filePath);

        return publicUrl;
    },

    async getKvkkText() {
        // Fetch from system_settings via API or direct DB if possible (but API is safer for separation)
        // Since we are in service, we might call the API we are about to create, OR direct DB if client-side safe.
        // Let's use direct DB for simple read if RLS allows public read.
        const { data, error } = await supabase
            .from('system_settings')
            .select('value')
            .eq('key', 'kvkk_text')
            .single();

        if (error) return null;
        return data?.value || '';
    },

    async updateKvkkText(text: string) {
        const { error } = await supabase
            .from('system_settings')
            .upsert({ key: 'kvkk_text', value: text })
            .select() // Return updated data
            .single();

        if (error) {
            console.error('Error updating KVKK text:', error);
            throw new Error(error.message);
        }
        return { success: true };
    }
};
