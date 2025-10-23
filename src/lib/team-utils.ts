import { supabase } from '@/lib/supabase/client';

export interface TeamMember {
  id?: string;
  name: string;
  email: string;
  phone: string;
  university_reg: string;
  is_leader?: boolean;
}

export interface TeamData {
  team_name: string;
  team_leader_name: string;
  team_leader_phone: string;
  team_leader_email: string;
  team_leader_university_reg: string;
  members: TeamMember[];
}

export interface Team {
  id: string;
  registration_id: string;
  team_name: string;
  team_leader_id: string;
  team_leader_name: string;
  team_leader_phone: string;
  team_leader_email: string;
  team_leader_university_reg: string;
  event_id: string;
  created_at: string;
  updated_at: string;
}

/**
 * Create a team with members
 */
export async function createTeamWithMembers(
  registrationId: string,
  eventId: string,
  teamData: TeamData
): Promise<string | null> {
  try {
    // Prepare members JSON (excluding leader)
    const membersJson = teamData.members.map(member => ({
      name: member.name,
      email: member.email,
      phone: member.phone,
      university_reg: member.university_reg
    }));

    // @ts-expect-error - RPC function not in generated types
    const { data, error } = await supabase.rpc('create_team_with_members', {
      p_registration_id: registrationId,
      p_team_name: teamData.team_name,
      p_team_leader_name: teamData.team_leader_name,
      p_team_leader_phone: teamData.team_leader_phone,
      p_team_leader_email: teamData.team_leader_email,
      p_team_leader_university_reg: teamData.team_leader_university_reg,
      p_event_id: eventId,
      p_members: membersJson
    });

    if (error) {
      console.error('Error creating team:', error);
      return null;
    }

    return data as string;
  } catch (error) {
    console.error('Error creating team with members:', error);
    return null;
  }
}

/**
 * Get team details including all members
 */
export async function getTeamDetails(teamId: string): Promise<any | null> {
  try {
    // @ts-expect-error - RPC function not in generated types
    const { data, error } = await supabase.rpc('get_team_details', {
      p_team_id: teamId
    });

    if (error) {
      console.error('Error getting team details:', error);
      return null;
    }

    return data;
  } catch (error) {
    console.error('Error fetching team details:', error);
    return null;
  }
}

/**
 * Get teams for an event
 */
export async function getEventTeams(eventId: string): Promise<Team[]> {
  try {
    const { data, error } = await supabase
      .from('teams')
      .select('*')
      .eq('event_id', eventId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching event teams:', error);
      return [];
    }

    return (data as Team[]) || [];
  } catch (error) {
    console.error('Error getting event teams:', error);
    return [];
  }
}

/**
 * Get team members for a team
 */
export async function getTeamMembers(teamId: string): Promise<any[]> {
  try {
    const { data, error } = await supabase
      .from('team_members')
      .select('*')
      .eq('team_id', teamId)
      .order('is_leader', { ascending: false })
      .order('joined_at', { ascending: true });

    if (error) {
      console.error('Error fetching team members:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Error getting team members:', error);
    return [];
  }
}

/**
 * Update team information
 */
export async function updateTeam(
  teamId: string,
  updates: Partial<Omit<Team, 'id' | 'created_at' | 'updated_at'>>
): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('teams')
      // @ts-expect-error - Type mismatch with partial update
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', teamId);

    if (error) {
      console.error('Error updating team:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error updating team:', error);
    return false;
  }
}

/**
 * Add member to team
 */
export async function addTeamMember(
  teamId: string,
  registrationId: string,
  member: TeamMember
): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('team_members')
      // @ts-expect-error - Type mismatch
      .insert({
        team_id: teamId,
        registration_id: registrationId,
        member_name: member.name,
        member_email: member.email,
        member_phone: member.phone,
        university_registration_number: member.university_reg,
        is_leader: false
      });

    if (error) {
      console.error('Error adding team member:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error adding team member:', error);
    return false;
  }
}

/**
 * Remove member from team
 */
export async function removeTeamMember(memberId: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('team_members')
      .delete()
      .eq('id', memberId);

    if (error) {
      console.error('Error removing team member:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error removing team member:', error);
    return false;
  }
}

/**
 * Validate team data
 */
export function validateTeamData(teamData: TeamData, teamSize: number): {
  valid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  // Validate team name
  if (!teamData.team_name || teamData.team_name.trim().length < 3) {
    errors.push('Team name must be at least 3 characters');
  }

  // Validate leader info
  if (!teamData.team_leader_name || teamData.team_leader_name.trim().length < 2) {
    errors.push('Team leader name is required');
  }

  if (!teamData.team_leader_email || !isValidEmail(teamData.team_leader_email)) {
    errors.push('Valid team leader email is required');
  }

  if (!teamData.team_leader_phone || !isValidPhone(teamData.team_leader_phone)) {
    errors.push('Valid team leader phone number is required');
  }

  if (!teamData.team_leader_university_reg || teamData.team_leader_university_reg.trim().length < 3) {
    errors.push('Team leader university registration number is required');
  }

  // Validate members
  if (teamData.members.length + 1 !== teamSize) {
    errors.push(`Total team size should be ${teamSize} (including leader)`);
  }

  teamData.members.forEach((member, index) => {
    if (!member.name || member.name.trim().length < 2) {
      errors.push(`Member ${index + 1}: Name is required`);
    }
    if (!member.email || !isValidEmail(member.email)) {
      errors.push(`Member ${index + 1}: Valid email is required`);
    }
    if (!member.phone || !isValidPhone(member.phone)) {
      errors.push(`Member ${index + 1}: Valid phone number is required`);
    }
    if (!member.university_reg || member.university_reg.trim().length < 3) {
      errors.push(`Member ${index + 1}: University registration number is required`);
    }
  });

  return {
    valid: errors.length === 0,
    errors
  };
}

/**
 * Validate email format
 */
function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Validate phone number format
 */
function isValidPhone(phone: string): boolean {
  const phoneRegex = /^[+]?[(]?[0-9]{3}[)]?[-\s.]?[0-9]{3}[-\s.]?[0-9]{4,6}$/;
  return phoneRegex.test(phone.replace(/\s/g, ''));
}
