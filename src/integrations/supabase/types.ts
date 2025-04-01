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
      answers: {
        Row: {
          answer_text: string
          explanation: string | null
          id: number
          points: number | null
          question_id: number | null
        }
        Insert: {
          answer_text: string
          explanation?: string | null
          id?: number
          points?: number | null
          question_id?: number | null
        }
        Update: {
          answer_text?: string
          explanation?: string | null
          id?: number
          points?: number | null
          question_id?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "answers_question_id_fkey"
            columns: ["question_id"]
            isOneToOne: false
            referencedRelation: "questions"
            referencedColumns: ["id"]
          },
        ]
      }
      categories: {
        Row: {
          id: number
          name: string
          quiz_id: number | null
        }
        Insert: {
          id?: number
          name: string
          quiz_id?: number | null
        }
        Update: {
          id?: number
          name?: string
          quiz_id?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "categories_quiz_id_fkey"
            columns: ["quiz_id"]
            isOneToOne: false
            referencedRelation: "quizzes"
            referencedColumns: ["id"]
          },
        ]
      }
      chapters: {
        Row: {
          chapter_text: string
          course_id: number | null
          id: number
          progress_when_finished: number | null
          quiz_id: number | null
          title: string | null
          video_link: string | null
        }
        Insert: {
          chapter_text: string
          course_id?: number | null
          id?: never
          progress_when_finished?: number | null
          quiz_id?: number | null
          title?: string | null
          video_link?: string | null
        }
        Update: {
          chapter_text?: string
          course_id?: number | null
          id?: never
          progress_when_finished?: number | null
          quiz_id?: number | null
          title?: string | null
          video_link?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "chapters_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "chapters_quiz_id_fkey"
            columns: ["quiz_id"]
            isOneToOne: false
            referencedRelation: "quizzes"
            referencedColumns: ["id"]
          },
        ]
      }
      comments: {
        Row: {
          comment_text: string
          course_id: number | null
          created_at: string | null
          id: number
          parent_comment_id: number | null
          rating: number | null
          type: string | null
          user_id: string | null
        }
        Insert: {
          comment_text: string
          course_id?: number | null
          created_at?: string | null
          id?: number
          parent_comment_id?: number | null
          rating?: number | null
          type?: string | null
          user_id?: string | null
        }
        Update: {
          comment_text?: string
          course_id?: number | null
          created_at?: string | null
          id?: number
          parent_comment_id?: number | null
          rating?: number | null
          type?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "comments_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "comments_parent_comment_id_fkey"
            columns: ["parent_comment_id"]
            isOneToOne: false
            referencedRelation: "comments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "comments_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["auth_user_id"]
          },
        ]
      }
      courses: {
        Row: {
          category_id: number | null
          course_time: number | null
          created_at: string | null
          creator_id: string | null
          description: string | null
          difficulty_level: string | null
          id: number
          media: string | null
          overall_rating: number | null
          price: number | null
          thumbnail: string | null
          title: string
        }
        Insert: {
          category_id?: number | null
          course_time?: number | null
          created_at?: string | null
          creator_id?: string | null
          description?: string | null
          difficulty_level?: string | null
          id?: number
          media?: string | null
          overall_rating?: number | null
          price?: number | null
          thumbnail?: string | null
          title: string
        }
        Update: {
          category_id?: number | null
          course_time?: number | null
          created_at?: string | null
          creator_id?: string | null
          description?: string | null
          difficulty_level?: string | null
          id?: number
          media?: string | null
          overall_rating?: number | null
          price?: number | null
          thumbnail?: string | null
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "courses_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
        ]
      }
      payments: {
        Row: {
          amount: number
          course_id: number
          created_at: string
          currency: string
          id: string
          status: string
          stripe_checkout_id: string | null
          stripe_payment_id: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          amount: number
          course_id: number
          created_at?: string
          currency?: string
          id?: string
          status?: string
          stripe_checkout_id?: string | null
          stripe_payment_id?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          amount?: number
          course_id?: number
          created_at?: string
          currency?: string
          id?: string
          status?: string
          stripe_checkout_id?: string | null
          stripe_payment_id?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_payments_course_id"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payments_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
        ]
      }
      questions: {
        Row: {
          id: number
          question_text: string
          quiz_id: number | null
        }
        Insert: {
          id?: number
          question_text: string
          quiz_id?: number | null
        }
        Update: {
          id?: number
          question_text?: string
          quiz_id?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "questions_quiz_id_fkey"
            columns: ["quiz_id"]
            isOneToOne: false
            referencedRelation: "quizzes"
            referencedColumns: ["id"]
          },
        ]
      }
      quizzes: {
        Row: {
          id: number
          title: string
        }
        Insert: {
          id?: number
          title: string
        }
        Update: {
          id?: number
          title?: string
        }
        Relationships: []
      }
      recommended_courses: {
        Row: {
          course_id: number
          recommendation_reason: string | null
          user_id: string
        }
        Insert: {
          course_id: number
          recommendation_reason?: string | null
          user_id: string
        }
        Update: {
          course_id?: number
          recommendation_reason?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_recommended_courses_course_id"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "recommended_courses_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "recommended_courses_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["auth_user_id"]
          },
        ]
      }
      subscribed_courses: {
        Row: {
          course_id: number
          progress: number | null
          rating: number | null
          user_id: string
        }
        Insert: {
          course_id: number
          progress?: number | null
          rating?: number | null
          user_id: string
        }
        Update: {
          course_id?: number
          progress?: number | null
          rating?: number | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "subscribed_courses_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["auth_user_id"]
          },
          {
            foreignKeyName: "user_courses_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
        ]
      }
      subscription_status: {
        Row: {
          created_at: string
          current_period_end: string | null
          id: string
          status: string
          stripe_subscription_id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          current_period_end?: string | null
          id?: string
          status?: string
          stripe_subscription_id: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          current_period_end?: string | null
          id?: string
          status?: string
          stripe_subscription_id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_chapter_progress: {
        Row: {
          chapter_id: number
          course_id: number
          finished: boolean
          user_id: string
        }
        Insert: {
          chapter_id: number
          course_id: number
          finished?: boolean
          user_id: string
        }
        Update: {
          chapter_id?: number
          course_id?: number
          finished?: boolean
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_user_chapter_progress_course_id"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_chapter_progress_chapter_id_fkey"
            columns: ["chapter_id"]
            isOneToOne: false
            referencedRelation: "chapters"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_chapter_progress_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
        ]
      }
      user_interest_categories: {
        Row: {
          category_id: number
          difficulty_level: string | null
          user_id: string
        }
        Insert: {
          category_id: number
          difficulty_level?: string | null
          user_id: string
        }
        Update: {
          category_id?: number
          difficulty_level?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_interest_categories_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_interest_categories_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["auth_user_id"]
          },
        ]
      }
      user_quiz_results: {
        Row: {
          id: number
          quiz_id: number | null
          score: number | null
          user_id: string | null
        }
        Insert: {
          id?: never
          quiz_id?: number | null
          score?: number | null
          user_id?: string | null
        }
        Update: {
          id?: never
          quiz_id?: number | null
          score?: number | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "user_quiz_results_quiz_id_fkey"
            columns: ["quiz_id"]
            isOneToOne: false
            referencedRelation: "quizzes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_quiz_results_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["auth_user_id"]
          },
        ]
      }
      users: {
        Row: {
          auth_user_id: string
          bio: string | null
          created_at: string | null
          id: number
          profile_picture: string | null
          username: string
        }
        Insert: {
          auth_user_id: string
          bio?: string | null
          created_at?: string | null
          id?: never
          profile_picture?: string | null
          username: string
        }
        Update: {
          auth_user_id?: string
          bio?: string | null
          created_at?: string | null
          id?: never
          profile_picture?: string | null
          username?: string
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

type PublicSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
        PublicSchema["Views"])
    ? (PublicSchema["Tables"] &
        PublicSchema["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][PublicEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof PublicSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof PublicSchema["CompositeTypes"]
    ? PublicSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never
