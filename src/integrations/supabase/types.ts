export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      comment_likes: {
        Row: {
          comment_id: string
          created_at: string
          id: string
          user_id: string | null
          user_identifier: string | null
        }
        Insert: {
          comment_id: string
          created_at?: string
          id?: string
          user_id?: string | null
          user_identifier?: string | null
        }
        Update: {
          comment_id?: string
          created_at?: string
          id?: string
          user_id?: string | null
          user_identifier?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "comment_likes_comment_id_fkey"
            columns: ["comment_id"]
            isOneToOne: false
            referencedRelation: "comments"
            referencedColumns: ["id"]
          },
        ]
      }
      comments: {
        Row: {
          article_id: string
          author_avatar: string | null
          author_email: string | null
          author_name: string
          content: string
          created_at: string
          id: string
          is_approved: boolean | null
          is_pinned: boolean | null
          likes_count: number | null
          parent_id: string | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          article_id: string
          author_avatar?: string | null
          author_email?: string | null
          author_name: string
          content: string
          created_at?: string
          id?: string
          is_approved?: boolean | null
          is_pinned?: boolean | null
          likes_count?: number | null
          parent_id?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          article_id?: string
          author_avatar?: string | null
          author_email?: string | null
          author_name?: string
          content?: string
          created_at?: string
          id?: string
          is_approved?: boolean | null
          is_pinned?: boolean | null
          likes_count?: number | null
          parent_id?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "comments_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "comments"
            referencedColumns: ["id"]
          },
        ]
      }
      media_reports: {
        Row: {
          created_at: string
          description: string | null
          id: string
          media_id: string
          reason: string
          reporter_identifier: string | null
          reporter_user_id: string | null
          status: string | null
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          media_id: string
          reason: string
          reporter_identifier?: string | null
          reporter_user_id?: string | null
          status?: string | null
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          media_id?: string
          reason?: string
          reporter_identifier?: string | null
          reporter_user_id?: string | null
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "media_reports_media_id_fkey"
            columns: ["media_id"]
            isOneToOne: false
            referencedRelation: "supporter_media"
            referencedColumns: ["id"]
          },
        ]
      }
      media_votes: {
        Row: {
          created_at: string
          id: string
          media_id: string
          user_id: string | null
          user_identifier: string | null
          vote_type: string
        }
        Insert: {
          created_at?: string
          id?: string
          media_id: string
          user_id?: string | null
          user_identifier?: string | null
          vote_type: string
        }
        Update: {
          created_at?: string
          id?: string
          media_id?: string
          user_id?: string | null
          user_identifier?: string | null
          vote_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "media_votes_media_id_fkey"
            columns: ["media_id"]
            isOneToOne: false
            referencedRelation: "supporter_media"
            referencedColumns: ["id"]
          },
        ]
      }
      notification_preferences: {
        Row: {
          comment_mentions: boolean | null
          comment_replies: boolean | null
          created_at: string
          email: string
          email_notifications: boolean | null
          id: string
          push_notifications: boolean | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          comment_mentions?: boolean | null
          comment_replies?: boolean | null
          created_at?: string
          email: string
          email_notifications?: boolean | null
          id?: string
          push_notifications?: boolean | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          comment_mentions?: boolean | null
          comment_replies?: boolean | null
          created_at?: string
          email?: string
          email_notifications?: boolean | null
          id?: string
          push_notifications?: boolean | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      notifications: {
        Row: {
          article_id: string | null
          created_at: string
          description: string | null
          icon: string
          id: string
          match_id: string | null
          read: boolean
          social_media_url: string | null
          thumbnail_url: string | null
          title: string
          type: string
          user_id: string | null
        }
        Insert: {
          article_id?: string | null
          created_at?: string
          description?: string | null
          icon: string
          id?: string
          match_id?: string | null
          read?: boolean
          social_media_url?: string | null
          thumbnail_url?: string | null
          title: string
          type: string
          user_id?: string | null
        }
        Update: {
          article_id?: string | null
          created_at?: string
          description?: string | null
          icon?: string
          id?: string
          match_id?: string | null
          read?: boolean
          social_media_url?: string | null
          thumbnail_url?: string | null
          title?: string
          type?: string
          user_id?: string | null
        }
        Relationships: []
      }
      processed_articles: {
        Row: {
          article_id: number
          article_title: string
          article_url: string | null
          id: string
          processed_at: string
        }
        Insert: {
          article_id: number
          article_title: string
          article_url?: string | null
          id?: string
          processed_at?: string
        }
        Update: {
          article_id?: number
          article_title?: string
          article_url?: string | null
          id?: string
          processed_at?: string
        }
        Relationships: []
      }
      supporter_media: {
        Row: {
          caption: string | null
          created_at: string
          file_size: number
          file_type: string
          file_url: string
          filename: string
          hashtags: string[] | null
          id: string
          is_approved: boolean | null
          is_featured: boolean | null
          original_filename: string
          reports_count: number | null
          thumbnail_url: string | null
          updated_at: string
          user_id: string
          votes_count: number | null
        }
        Insert: {
          caption?: string | null
          created_at?: string
          file_size: number
          file_type: string
          file_url: string
          filename: string
          hashtags?: string[] | null
          id?: string
          is_approved?: boolean | null
          is_featured?: boolean | null
          original_filename: string
          reports_count?: number | null
          thumbnail_url?: string | null
          updated_at?: string
          user_id: string
          votes_count?: number | null
        }
        Update: {
          caption?: string | null
          created_at?: string
          file_size?: number
          file_type?: string
          file_url?: string
          filename?: string
          hashtags?: string[] | null
          id?: string
          is_approved?: boolean | null
          is_featured?: boolean | null
          original_filename?: string
          reports_count?: number | null
          thumbnail_url?: string | null
          updated_at?: string
          user_id?: string
          votes_count?: number | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
