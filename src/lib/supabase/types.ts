export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type UserRole = 'admin' | 'attendee' | 'organizer'
export type EventStatus = 'draft' | 'published' | 'cancelled' | 'completed'
export type RegistrationStatus = 'pending' | 'confirmed' | 'cancelled' | 'attended'
export type PaymentStatus = 'pending' | 'completed' | 'failed' | 'refunded'
export type TicketType = 'free' | 'paid' | 'vip' | 'early_bird'

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
          created_at?: string
          updated_at?: string
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
          created_at?: string
          updated_at?: string
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
          type: string
          read: boolean
          link: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          title: string
          message: string
          type: string
          read?: boolean
          link?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          title?: string
          message?: string
          type?: string
          read?: boolean
          link?: string | null
          created_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      user_role: UserRole
      event_status: EventStatus
      registration_status: RegistrationStatus
      payment_status: PaymentStatus
      ticket_type: TicketType
    }
  }
}
