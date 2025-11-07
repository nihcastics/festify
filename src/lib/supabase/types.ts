export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type UserRole = 'admin' | 'attendee' | 'organizer'
export type EventStatus = 'draft' | 'published' | 'cancelled' | 'completed'
export type ParticipationType = 'individual' | 'team' | 'both'
export type RegistrationStatus = 'pending' | 'confirmed' | 'cancelled' | 'attended'
export type PaymentStatus = 'pending' | 'processing' | 'completed' | 'failed' | 'refunded'
export type TicketType = 'free' | 'paid' | 'vip' | 'early_bird'
export type NotificationType = 
  | 'registration_confirmed'
  | 'registration_cancelled'
  | 'event_reminder'
  | 'event_update'
  | 'team_invite'
  | 'team_joined'
  | 'team_left'
  | 'event_cancelled'
  | 'event_rescheduled'
  | 'payment_received'
  | 'ticket_issued'
  | 'general'

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          email: string
          full_name: string
          role: UserRole
          avatar_url: string | null
          phone: string | null
          bio: string | null
          organization_name: string | null
          website: string | null
          college_id: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          full_name: string
          role?: UserRole
          avatar_url?: string | null
          phone?: string | null
          bio?: string | null
          organization_name?: string | null
          website?: string | null
          college_id?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          full_name?: string
          role?: UserRole
          avatar_url?: string | null
          phone?: string | null
          bio?: string | null
          organization_name?: string | null
          website?: string | null
          college_id?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      colleges: {
        Row: {
          id: string
          name: string
          location: string
          description: string | null
          logo_url: string | null
          website: string | null
          established_year: number | null
          contact_email: string | null
          contact_phone: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          location: string
          description?: string | null
          logo_url?: string | null
          website?: string | null
          established_year?: number | null
          contact_email?: string | null
          contact_phone?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          location?: string
          description?: string | null
          logo_url?: string | null
          website?: string | null
          established_year?: number | null
          contact_email?: string | null
          contact_phone?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      categories: {
        Row: {
          id: string
          name: string
          description: string | null
          icon_name: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          icon_name?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          icon_name?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      events: {
        Row: {
          id: string
          title: string
          description: string
          organizer_id: string
          college_id: string | null
          category_id: string
          event_status: EventStatus
          participation_type: ParticipationType
          team_size_min: number | null
          team_size_max: number | null
          start_date: string
          end_date: string
          location: string
          venue_details: string | null
          image_url: string | null
          max_attendees: number | null
          current_attendees: number
          registration_deadline: string | null
          is_featured: boolean
          is_global: boolean
          tags: string[]
          individual_price: number
          team_base_price: number
          price_per_member: number
          has_custom_team_pricing: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          description: string
          organizer_id: string
          college_id?: string | null
          category_id: string
          event_status?: EventStatus
          participation_type?: ParticipationType
          team_size_min?: number | null
          team_size_max?: number | null
          start_date: string
          end_date: string
          location: string
          venue_details?: string | null
          image_url?: string | null
          max_attendees?: number | null
          current_attendees?: number
          registration_deadline?: string | null
          is_featured?: boolean
          is_global?: boolean
          tags?: string[]
          individual_price?: number
          team_base_price?: number
          price_per_member?: number
          has_custom_team_pricing?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string
          description?: string
          organizer_id?: string
          college_id?: string | null
          category_id?: string
          event_status?: EventStatus
          participation_type?: ParticipationType
          team_size_min?: number | null
          team_size_max?: number | null
          start_date?: string
          end_date?: string
          location?: string
          venue_details?: string | null
          image_url?: string | null
          max_attendees?: number | null
          current_attendees?: number
          registration_deadline?: string | null
          is_featured?: boolean
          is_global?: boolean
          tags?: string[]
          individual_price?: number
          team_base_price?: number
          price_per_member?: number
          has_custom_team_pricing?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      team_pricing_tiers: {
        Row: {
          id: string
          event_id: string
          min_members: number
          max_members: number
          price: number
          created_at: string
        }
        Insert: {
          id?: string
          event_id: string
          min_members: number
          max_members: number
          price: number
          created_at?: string
        }
        Update: {
          id?: string
          event_id?: string
          min_members?: number
          max_members?: number
          price?: number
          created_at?: string
        }
      }
      registrations: {
        Row: {
          id: string
          event_id: string
          user_id: string
          registration_status: RegistrationStatus
          registration_date: string
          attended_at: string | null
          notes: string | null
          is_team: boolean
          team_size: number
          team_name: string | null
          team_leader_name: string | null
          team_leader_phone: string | null
          team_leader_email: string | null
          team_leader_university_reg: string | null
          payment_status: PaymentStatus
          payment_amount: number
          payment_method: string | null
          transaction_id: string | null
          paid_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          event_id: string
          user_id: string
          registration_status?: RegistrationStatus
          registration_date?: string
          attended_at?: string | null
          notes?: string | null
          is_team?: boolean
          team_size?: number
          team_name?: string | null
          team_leader_name?: string | null
          team_leader_phone?: string | null
          team_leader_email?: string | null
          team_leader_university_reg?: string | null
          payment_status?: PaymentStatus
          payment_amount?: number
          payment_method?: string | null
          transaction_id?: string | null
          paid_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          event_id?: string
          user_id?: string
          registration_status?: RegistrationStatus
          registration_date?: string
          attended_at?: string | null
          notes?: string | null
          is_team?: boolean
          team_size?: number
          team_name?: string | null
          team_leader_name?: string | null
          team_leader_phone?: string | null
          team_leader_email?: string | null
          team_leader_university_reg?: string | null
          payment_status?: PaymentStatus
          payment_amount?: number
          payment_method?: string | null
          transaction_id?: string | null
          paid_at?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      teams: {
        Row: {
          id: string
          registration_id: string
          team_name: string
          team_leader_id: string | null
          team_leader_name: string
          team_leader_phone: string | null
          team_leader_email: string | null
          team_leader_university_reg: string | null
          event_id: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          registration_id: string
          team_name: string
          team_leader_id?: string | null
          team_leader_name: string
          team_leader_phone?: string | null
          team_leader_email?: string | null
          team_leader_university_reg?: string | null
          event_id: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          registration_id?: string
          team_name?: string
          team_leader_id?: string | null
          team_leader_name?: string
          team_leader_phone?: string | null
          team_leader_email?: string | null
          team_leader_university_reg?: string | null
          event_id?: string
          created_at?: string
          updated_at?: string
        }
      }
      team_members: {
        Row: {
          id: string
          team_id: string
          member_name: string
          member_email: string | null
          member_phone: string | null
          university_registration_number: string | null
          is_leader: boolean
          joined_at: string
        }
        Insert: {
          id?: string
          team_id: string
          member_name: string
          member_email?: string | null
          member_phone?: string | null
          university_registration_number?: string | null
          is_leader?: boolean
          joined_at?: string
        }
        Update: {
          id?: string
          team_id?: string
          member_name?: string
          member_email?: string | null
          member_phone?: string | null
          university_registration_number?: string | null
          is_leader?: boolean
          joined_at?: string
        }
      }
      tickets: {
        Row: {
          id: string
          event_id: string
          registration_id: string | null
          ticket_type: TicketType
          price: number
          ticket_code: string
          is_valid: boolean
          issued_at: string
          used_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          event_id: string
          registration_id?: string | null
          ticket_type?: TicketType
          price?: number
          ticket_code: string
          is_valid?: boolean
          issued_at?: string
          used_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          event_id?: string
          registration_id?: string | null
          ticket_type?: TicketType
          price?: number
          ticket_code?: string
          is_valid?: boolean
          issued_at?: string
          used_at?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      payments: {
        Row: {
          id: string
          registration_id: string
          ticket_id: string | null
          amount: number
          payment_status: PaymentStatus
          payment_method: string | null
          transaction_id: string | null
          payment_date: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          registration_id: string
          ticket_id?: string | null
          amount: number
          payment_status?: PaymentStatus
          payment_method?: string | null
          transaction_id?: string | null
          payment_date?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          registration_id?: string
          ticket_id?: string | null
          amount?: number
          payment_status?: PaymentStatus
          payment_method?: string | null
          transaction_id?: string | null
          payment_date?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      event_updates: {
        Row: {
          id: string
          event_id: string
          title: string
          content: string
          posted_by: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          event_id: string
          title: string
          content: string
          posted_by: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          event_id?: string
          title?: string
          content?: string
          posted_by?: string
          created_at?: string
          updated_at?: string
        }
      }
      reviews: {
        Row: {
          id: string
          event_id: string
          user_id: string
          rating: number
          comment: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          event_id: string
          user_id: string
          rating: number
          comment?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          event_id?: string
          user_id?: string
          rating?: number
          comment?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      favorites: {
        Row: {
          id: string
          user_id: string
          event_id: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          event_id: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          event_id?: string
          created_at?: string
        }
      }
      notifications: {
        Row: {
          id: string
          user_id: string
          title: string
          message: string
          notification_type: NotificationType
          read: boolean
          link: string | null
          event_id: string | null
          registration_id: string | null
          team_id: string | null
          action_url: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          title: string
          message: string
          notification_type?: NotificationType
          read?: boolean
          link?: string | null
          event_id?: string | null
          registration_id?: string | null
          team_id?: string | null
          action_url?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          title?: string
          message?: string
          notification_type?: NotificationType
          read?: boolean
          link?: string | null
          event_id?: string | null
          registration_id?: string | null
          team_id?: string | null
          action_url?: string | null
          created_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      calculate_registration_price: {
        Args: {
          p_event_id: string
          p_is_team: boolean
          p_team_size?: number
        }
        Returns: number
      }
      create_team_with_members: {
        Args: {
          p_registration_id: string
          p_team_name: string
          p_team_leader_name: string
          p_team_leader_phone: string
          p_team_leader_email: string
          p_team_leader_university_reg: string
          p_event_id: string
          p_members: Json
        }
        Returns: string
      }
      get_team_details: {
        Args: {
          p_team_id: string
        }
        Returns: Json
      }
      get_event_pricing_summary: {
        Args: {
          p_event_id: string
        }
        Returns: Json
      }
    }
    Enums: {
      user_role: UserRole
      event_status: EventStatus
      participation_type: ParticipationType
      registration_status: RegistrationStatus
      payment_status: PaymentStatus
      ticket_type: TicketType
      notification_type: NotificationType
    }
  }
}
