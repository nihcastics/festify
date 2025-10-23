import { supabase } from '@/lib/supabase/client';

export interface PricingInfo {
  event_id: string;
  individual_price: number;
  team_base_price: number;
  price_per_member: number;
  has_custom_pricing: boolean;
  participation_type: string;
  team_size_min: number | null;
  team_size_max: number | null;
  custom_tiers?: Array<{
    min_members: number;
    max_members: number;
    price: number;
  }>;
}

export interface TeamPricingTier {
  id?: string;
  event_id: string;
  min_members: number;
  max_members: number;
  price: number;
}

/**
 * Calculate registration price based on event pricing configuration
 */
export async function calculateRegistrationPrice(
  eventId: string,
  isTeam: boolean,
  teamSize: number = 1
): Promise<number> {
  try {
    // Try using RPC function first
    // @ts-expect-error - RPC function not in generated types yet
    const { data, error } = await supabase.rpc('calculate_registration_price', {
      p_event_id: eventId,
      p_is_team: isTeam,
      p_team_size: teamSize
    });

    if (error) {
      // If RPC function doesn't exist, fall back to manual calculation
      if (error.code === '42883') {
        console.warn('RPC function not found, calculating price manually');
        
        const { data: eventData, error: eventError } = await supabase
          .from('events')
          .select('individual_price, team_base_price, price_per_member, has_custom_team_pricing, participation_type')
          .eq('id', eventId)
          .single();

        if (eventError || !eventData) {
          console.error('Error fetching event data:', eventError);
          return 0;
        }

        const event = eventData as any;

        if (!isTeam) {
          return event.individual_price || 0;
        } else {
          if (event.has_custom_team_pricing) {
            // Try to get custom tier pricing
            const { data: tierData } = await supabase
              .from('team_pricing_tiers')
              .select('price')
              .eq('event_id', eventId)
              .lte('min_members', teamSize)
              .gte('max_members', teamSize)
              .single();

            if (tierData) {
              return (tierData as any).price || 0;
            }
          }
          
          // Use base price + per member pricing
          const basePrice = event.team_base_price || 0;
          const perMember = event.price_per_member || 0;
          const additionalMembers = Math.max(0, teamSize - 1);
          return basePrice + (additionalMembers * perMember);
        }
      }
      
      console.error('Error calculating price:', error);
      return 0;
    }

    return data || 0;
  } catch (err) {
    console.error('Price calculation exception:', err);
    return 0;
  }
}

/**
 * Process payment for a registration
 */
export async function processRegistrationPayment(
  registrationId: string,
  amount: number,
  paymentMethod: string = 'bypass',
  transactionId?: string
): Promise<boolean> {
  const txId = transactionId || `BYPASS-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  
  console.log('Starting payment processing:', {
    registrationId,
    amount,
    paymentMethod,
    txId
  });
  
  try {
    // Verify the registration exists
    const { data: registration, error: fetchError } = await supabase
      .from('registrations')
      .select('id, registration_status, payment_status')
      .eq('id', registrationId)
      .single();

    if (fetchError || !registration) {
      console.error('Registration not found:', fetchError);
      return false;
    }

    console.log('Registration found:', registration);

    // Update registration with payment details
    const { data: updateData, error: updateError } = await supabase
      .from('registrations')
      // @ts-expect-error - Supabase type inference issue
      .update({
        registration_status: 'confirmed',
        payment_status: 'completed',
        payment_amount: amount,
        payment_method: paymentMethod,
        transaction_id: txId,
        paid_at: new Date().toISOString()
      })
      .eq('id', registrationId)
      .select();

    if (updateError) {
      console.error('Payment update error:', updateError);
      return false;
    }
    
    console.log('Payment processed successfully:', updateData);
    return true;
  } catch (err: any) {
    console.error('Payment processing exception:', err);
    return false;
  }
}

/**
 * Get event pricing summary including custom tiers
 */
export async function getEventPricingSummary(eventId: string): Promise<PricingInfo | null> {
  // @ts-expect-error - RPC function not in generated types yet
  const { data, error } = await supabase.rpc('get_event_pricing_summary', {
    p_event_id: eventId
  });

  if (error) {
    console.error('Error getting pricing summary:', error);
    return null;
  }

  return data;
}

/**
 * Format price for display
 */
export function formatPrice(price: number): string {
  return `₹${price.toFixed(2)}`;
}

/**
 * Calculate price breakdown for teams
 */
export function calculateTeamPriceBreakdown(
  basePrice: number,
  pricePerMember: number,
  teamSize: number
): {
  basePrice: number;
  additionalMembersCost: number;
  totalPrice: number;
} {
  const additionalMembers = Math.max(0, teamSize - 1);
  const additionalMembersCost = additionalMembers * pricePerMember;
  const totalPrice = basePrice + additionalMembersCost;

  return {
    basePrice,
    additionalMembersCost,
    totalPrice
  };
}

/**
 * Find applicable pricing tier for a team size
 */
export function findApplicableTier(
  tiers: TeamPricingTier[],
  teamSize: number
): TeamPricingTier | null {
  return tiers.find(
    tier => teamSize >= tier.min_members && teamSize <= tier.max_members
  ) || null;
}

/**
 * Save team pricing tiers for an event
 */
export async function saveTeamPricingTiers(
  eventId: string,
  tiers: Omit<TeamPricingTier, 'id' | 'event_id'>[]
): Promise<boolean> {
  // Delete existing tiers
  const { error: deleteError } = await supabase
    .from('team_pricing_tiers')
    .delete()
    .eq('event_id', eventId);

  if (deleteError) {
    console.error('Error deleting old tiers:', deleteError);
    return false;
  }

  // Insert new tiers
  if (tiers.length > 0) {
    const tiersWithEventId = tiers.map(tier => ({
      ...tier,
      event_id: eventId
    }));

    const { error: insertError } = await supabase
      .from('team_pricing_tiers')
      // @ts-expect-error - Table not in generated types yet
      .insert(tiersWithEventId);

    if (insertError) {
      console.error('Error inserting new tiers:', insertError);
      return false;
    }
  }

  return true;
}

/**
 * Get team pricing tiers for an event
 */
export async function getTeamPricingTiers(eventId: string): Promise<TeamPricingTier[]> {
  const { data, error } = await supabase
    .from('team_pricing_tiers')
    .select('*')
    .eq('event_id', eventId)
    .order('min_members', { ascending: true });

  if (error) {
    console.error('Error fetching tiers:', error);
    return [];
  }

  return data || [];
}

/**
 * Update event pricing configuration
 */
export async function updateEventPricing(
  eventId: string,
  pricing: {
    individual_price?: number;
    team_base_price?: number;
    price_per_member?: number;
    has_custom_team_pricing?: boolean;
  }
): Promise<boolean> {
  const { error } = await supabase
    .from('events')
    // @ts-expect-error - Pricing columns not in generated types yet
    .update(pricing)
    .eq('id', eventId);

  if (error) {
    console.error('Error updating event pricing:', error);
    return false;
  }

  return true;
}

/**
 * Validate pricing configuration
 */
export function validatePricing(pricing: {
  participation_type: string;
  individual_price?: number;
  team_base_price?: number;
  price_per_member?: number;
  has_custom_team_pricing?: boolean;
  custom_tiers?: TeamPricingTier[];
}): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (pricing.participation_type === 'individual' || pricing.participation_type === 'both') {
    if (!pricing.individual_price || pricing.individual_price <= 0) {
      errors.push('Individual price must be greater than 0');
    }
  }

  if (pricing.participation_type === 'team' || pricing.participation_type === 'both') {
    if (pricing.has_custom_team_pricing) {
      if (!pricing.custom_tiers || pricing.custom_tiers.length === 0) {
        errors.push('At least one pricing tier is required for custom team pricing');
      } else {
        // Validate tiers don't overlap
        const sortedTiers = [...pricing.custom_tiers].sort((a, b) => a.min_members - b.min_members);
        for (let i = 0; i < sortedTiers.length - 1; i++) {
          if (sortedTiers[i].max_members >= sortedTiers[i + 1].min_members) {
            errors.push('Pricing tiers cannot overlap');
            break;
          }
        }
        
        // Validate each tier
        pricing.custom_tiers.forEach((tier, index) => {
          if (tier.min_members <= 0) {
            errors.push(`Tier ${index + 1}: Minimum members must be greater than 0`);
          }
          if (tier.max_members < tier.min_members) {
            errors.push(`Tier ${index + 1}: Maximum members must be >= minimum members`);
          }
          if (tier.price <= 0) {
            errors.push(`Tier ${index + 1}: Price must be greater than 0`);
          }
        });
      }
    } else {
      if (!pricing.team_base_price || pricing.team_base_price <= 0) {
        errors.push('Team base price must be greater than 0');
      }
      if (pricing.price_per_member === undefined || pricing.price_per_member < 0) {
        errors.push('Price per member must be 0 or greater');
      }
    }
  }

  return {
    valid: errors.length === 0,
    errors
  };
}
