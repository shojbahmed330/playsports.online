export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  graphql_public: {
    Tables: {
      [_ in never]: never
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      graphql: {
        Args: {
          extensions?: Json
          operationName?: string
          query?: string
          variables?: Json
        }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  public: {
    Tables: {
      affiliate_links: {
        Row: {
          active: boolean
          click_count: number
          created_at: string
          cta_label: string
          description: string | null
          geo_restrict: string[] | null
          id: string
          image_url: string | null
          league_slug: string | null
          network: string
          placement: string
          priority: number
          sport: string | null
          team_slug: string | null
          title: string
          updated_at: string
          url: string
        }
        Insert: {
          active?: boolean
          click_count?: number
          created_at?: string
          cta_label?: string
          description?: string | null
          geo_restrict?: string[] | null
          id?: string
          image_url?: string | null
          league_slug?: string | null
          network: string
          placement?: string
          priority?: number
          sport?: string | null
          team_slug?: string | null
          title: string
          updated_at?: string
          url: string
        }
        Update: {
          active?: boolean
          click_count?: number
          created_at?: string
          cta_label?: string
          description?: string | null
          geo_restrict?: string[] | null
          id?: string
          image_url?: string | null
          league_slug?: string | null
          network?: string
          placement?: string
          priority?: number
          sport?: string | null
          team_slug?: string | null
          title?: string
          updated_at?: string
          url?: string
        }
        Relationships: []
      }
      contact_messages: {
        Row: {
          body: string
          created_at: string
          email: string
          id: string
          name: string
          subject: string | null
          user_agent: string | null
        }
        Insert: {
          body: string
          created_at?: string
          email: string
          id?: string
          name: string
          subject?: string | null
          user_agent?: string | null
        }
        Update: {
          body?: string
          created_at?: string
          email?: string
          id?: string
          name?: string
          subject?: string | null
          user_agent?: string | null
        }
        Relationships: []
      }
      digest_runs: {
        Row: {
          created_at: string
          error: string | null
          html: string
          id: string
          recipient_count: number
          sent_at: string | null
          sent_count: number
          status: string
          story_count: number
          subject: string
        }
        Insert: {
          created_at?: string
          error?: string | null
          html: string
          id?: string
          recipient_count?: number
          sent_at?: string | null
          sent_count?: number
          status?: string
          story_count?: number
          subject: string
        }
        Update: {
          created_at?: string
          error?: string | null
          html?: string
          id?: string
          recipient_count?: number
          sent_at?: string | null
          sent_count?: number
          status?: string
          story_count?: number
          subject?: string
        }
        Relationships: []
      }
      memberships: {
        Row: {
          created_at: string
          granted_by: string | null
          note: string | null
          premium_until: string | null
          tier: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          granted_by?: string | null
          note?: string | null
          premium_until?: string | null
          tier?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          granted_by?: string | null
          note?: string | null
          premium_until?: string | null
          tier?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      newsletter_subscribers: {
        Row: {
          consent_marketing: boolean
          created_at: string
          email: string
          id: string
          last_sent_at: string | null
          source: string | null
          status: string
          unsubscribe_token: string
        }
        Insert: {
          consent_marketing?: boolean
          created_at?: string
          email: string
          id?: string
          last_sent_at?: string | null
          source?: string | null
          status?: string
          unsubscribe_token?: string
        }
        Update: {
          consent_marketing?: boolean
          created_at?: string
          email?: string
          id?: string
          last_sent_at?: string | null
          source?: string | null
          status?: string
          unsubscribe_token?: string
        }
        Relationships: []
      }
      site_settings: {
        Row: {
          key: string
          updated_at: string
          value: Json
        }
        Insert: {
          key: string
          updated_at?: string
          value?: Json
        }
        Update: {
          key?: string
          updated_at?: string
          value?: Json
        }
        Relationships: []
      }
      sponsored_slots: {
        Row: {
          active: boolean
          clicks: number
          created_at: string
          description: string | null
          ends_at: string | null
          id: string
          image_url: string | null
          impressions: number
          priority: number
          ref_id: string | null
          slot_type: string
          sponsor_logo_url: string | null
          sponsor_name: string
          sport: string | null
          starts_at: string
          target_url: string
          title: string
          updated_at: string
        }
        Insert: {
          active?: boolean
          clicks?: number
          created_at?: string
          description?: string | null
          ends_at?: string | null
          id?: string
          image_url?: string | null
          impressions?: number
          priority?: number
          ref_id?: string | null
          slot_type: string
          sponsor_logo_url?: string | null
          sponsor_name: string
          sport?: string | null
          starts_at?: string
          target_url: string
          title: string
          updated_at?: string
        }
        Update: {
          active?: boolean
          clicks?: number
          created_at?: string
          description?: string | null
          ends_at?: string | null
          id?: string
          image_url?: string | null
          impressions?: number
          priority?: number
          ref_id?: string | null
          slot_type?: string
          sponsor_logo_url?: string | null
          sponsor_name?: string
          sport?: string | null
          starts_at?: string
          target_url?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      wc_appearances: {
        Row: {
          assists: number | null
          clean_sheets: number | null
          country: string
          goals: number | null
          id: number
          matches_played: number | null
          minutes_played: number | null
          player_name: string
          red_cards: number | null
          tournament_year: number | null
          yellow_cards: number | null
        }
        Insert: {
          assists?: number | null
          clean_sheets?: number | null
          country: string
          goals?: number | null
          id?: number
          matches_played?: number | null
          minutes_played?: number | null
          player_name: string
          red_cards?: number | null
          tournament_year?: number | null
          yellow_cards?: number | null
        }
        Update: {
          assists?: number | null
          clean_sheets?: number | null
          country?: string
          goals?: number | null
          id?: number
          matches_played?: number | null
          minutes_played?: number | null
          player_name?: string
          red_cards?: number | null
          tournament_year?: number | null
          yellow_cards?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "wc_appearances_tournament_year_fkey"
            columns: ["tournament_year"]
            isOneToOne: false
            referencedRelation: "wc_tournaments"
            referencedColumns: ["year"]
          },
        ]
      }
      wc_cards: {
        Row: {
          card_type: string | null
          country: string
          id: number
          match_id: number | null
          minute: number | null
          player_name: string
          reason: string | null
          tournament_year: number | null
        }
        Insert: {
          card_type?: string | null
          country: string
          id?: number
          match_id?: number | null
          minute?: number | null
          player_name: string
          reason?: string | null
          tournament_year?: number | null
        }
        Update: {
          card_type?: string | null
          country?: string
          id?: number
          match_id?: number | null
          minute?: number | null
          player_name?: string
          reason?: string | null
          tournament_year?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "wc_cards_match_id_fkey"
            columns: ["match_id"]
            isOneToOne: false
            referencedRelation: "wc_matches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "wc_cards_tournament_year_fkey"
            columns: ["tournament_year"]
            isOneToOne: false
            referencedRelation: "wc_tournaments"
            referencedColumns: ["year"]
          },
        ]
      }
      wc_goals: {
        Row: {
          country: string
          extra_minute: number | null
          goal_type: string | null
          id: number
          match_id: number | null
          match_period: string | null
          minute: number | null
          player_name: string
          tournament_year: number | null
        }
        Insert: {
          country: string
          extra_minute?: number | null
          goal_type?: string | null
          id?: number
          match_id?: number | null
          match_period?: string | null
          minute?: number | null
          player_name: string
          tournament_year?: number | null
        }
        Update: {
          country?: string
          extra_minute?: number | null
          goal_type?: string | null
          id?: number
          match_id?: number | null
          match_period?: string | null
          minute?: number | null
          player_name?: string
          tournament_year?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "wc_goals_match_id_fkey"
            columns: ["match_id"]
            isOneToOne: false
            referencedRelation: "wc_matches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "wc_goals_tournament_year_fkey"
            columns: ["tournament_year"]
            isOneToOne: false
            referencedRelation: "wc_tournaments"
            referencedColumns: ["year"]
          },
        ]
      }
      wc_groups: {
        Row: {
          drawn: number | null
          goals_against: number | null
          goals_for: number | null
          group_name: string
          id: number
          lost: number | null
          played: number | null
          points: number | null
          position: number | null
          qualified: boolean | null
          team: string
          tournament_year: number | null
          won: number | null
        }
        Insert: {
          drawn?: number | null
          goals_against?: number | null
          goals_for?: number | null
          group_name: string
          id?: number
          lost?: number | null
          played?: number | null
          points?: number | null
          position?: number | null
          qualified?: boolean | null
          team: string
          tournament_year?: number | null
          won?: number | null
        }
        Update: {
          drawn?: number | null
          goals_against?: number | null
          goals_for?: number | null
          group_name?: string
          id?: number
          lost?: number | null
          played?: number | null
          points?: number | null
          position?: number | null
          qualified?: boolean | null
          team?: string
          tournament_year?: number | null
          won?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "wc_groups_tournament_year_fkey"
            columns: ["tournament_year"]
            isOneToOne: false
            referencedRelation: "wc_tournaments"
            referencedColumns: ["year"]
          },
        ]
      }
      wc_match_events: {
        Row: {
          event_type: string | null
          id: number
          match_id: number | null
          minute: number | null
          player_name: string | null
          team: string | null
        }
        Insert: {
          event_type?: string | null
          id?: number
          match_id?: number | null
          minute?: number | null
          player_name?: string | null
          team?: string | null
        }
        Update: {
          event_type?: string | null
          id?: number
          match_id?: number | null
          minute?: number | null
          player_name?: string | null
          team?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "wc_match_events_match_id_fkey"
            columns: ["match_id"]
            isOneToOne: false
            referencedRelation: "wc_matches"
            referencedColumns: ["id"]
          },
        ]
      }
      wc_matches: {
        Row: {
          away_score: number | null
          away_score_pen: number | null
          away_team: string
          city: string | null
          created_at: string | null
          group_name: string | null
          home_score: number | null
          home_score_pen: number | null
          home_team: string
          id: number
          match_date: string | null
          match_number: number | null
          round: string
          stadium: string | null
          tournament_year: number | null
          video_url: string | null
        }
        Insert: {
          away_score?: number | null
          away_score_pen?: number | null
          away_team: string
          city?: string | null
          created_at?: string | null
          group_name?: string | null
          home_score?: number | null
          home_score_pen?: number | null
          home_team: string
          id?: number
          match_date?: string | null
          match_number?: number | null
          round: string
          stadium?: string | null
          tournament_year?: number | null
          video_url?: string | null
        }
        Update: {
          away_score?: number | null
          away_score_pen?: number | null
          away_team?: string
          city?: string | null
          created_at?: string | null
          group_name?: string | null
          home_score?: number | null
          home_score_pen?: number | null
          home_team?: string
          id?: number
          match_date?: string | null
          match_number?: number | null
          round?: string
          stadium?: string | null
          tournament_year?: number | null
          video_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "wc_matches_tournament_year_fkey"
            columns: ["tournament_year"]
            isOneToOne: false
            referencedRelation: "wc_tournaments"
            referencedColumns: ["year"]
          },
        ]
      }
      wc_players: {
        Row: {
          country: string
          created_at: string | null
          date_of_birth: string | null
          id: number
          name: string
          player_id: string | null
          position: string | null
        }
        Insert: {
          country: string
          created_at?: string | null
          date_of_birth?: string | null
          id?: number
          name: string
          player_id?: string | null
          position?: string | null
        }
        Update: {
          country?: string
          created_at?: string | null
          date_of_birth?: string | null
          id?: number
          name?: string
          player_id?: string | null
          position?: string | null
        }
        Relationships: []
      }
      wc_squads: {
        Row: {
          country: string
          id: number
          is_captain: boolean | null
          player_name: string
          position: string | null
          shirt_number: number | null
          tournament_year: number | null
        }
        Insert: {
          country: string
          id?: number
          is_captain?: boolean | null
          player_name: string
          position?: string | null
          shirt_number?: number | null
          tournament_year?: number | null
        }
        Update: {
          country?: string
          id?: number
          is_captain?: boolean | null
          player_name?: string
          position?: string | null
          shirt_number?: number | null
          tournament_year?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "wc_squads_tournament_year_fkey"
            columns: ["tournament_year"]
            isOneToOne: false
            referencedRelation: "wc_tournaments"
            referencedColumns: ["year"]
          },
        ]
      }
      wc_teams: {
        Row: {
          flag_code: string | null
          id: number
          name: string
          tournament_year: number | null
        }
        Insert: {
          flag_code?: string | null
          id?: number
          name: string
          tournament_year?: number | null
        }
        Update: {
          flag_code?: string | null
          id?: number
          name?: string
          tournament_year?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "wc_teams_tournament_year_fkey"
            columns: ["tournament_year"]
            isOneToOne: false
            referencedRelation: "wc_tournaments"
            referencedColumns: ["year"]
          },
        ]
      }
      wc_tournaments: {
        Row: {
          champion: string | null
          fourth_place: string | null
          host_country: string
          id: number
          runner_up: string | null
          third_place: string | null
          year: number
        }
        Insert: {
          champion?: string | null
          fourth_place?: string | null
          host_country: string
          id?: number
          runner_up?: string | null
          third_place?: string | null
          year: number
        }
        Update: {
          champion?: string | null
          fourth_place?: string | null
          host_country?: string
          id?: number
          runner_up?: string | null
          third_place?: string | null
          year?: number
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "moderator" | "user"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {
      app_role: ["admin", "moderator", "user"],
    },
  },
} as const
