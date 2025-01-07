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
      biomedical_responses: {
        Row: {
          assessment_id: string | null
          bmi: number | null
          comorbidities: string[] | null
          created_at: string | null
          id: string
          morning_stiffness: number | null
          movement_patterns: Json | null
          muscle_strength: Json | null
          neurological_symptoms: string[] | null
          pain_duration: number | null
          pain_intensity: number | null
          pain_location:
            | Database["public"]["Enums"]["pain_location_type"]
            | null
          pain_pattern: Database["public"]["Enums"]["pain_pattern_type"] | null
          physical_fitness_level: number | null
          posture_assessment: Json | null
          previous_injuries: Json | null
          rom_limitations: Json | null
          sleep_quality: number | null
        }
        Insert: {
          assessment_id?: string | null
          bmi?: number | null
          comorbidities?: string[] | null
          created_at?: string | null
          id?: string
          morning_stiffness?: number | null
          movement_patterns?: Json | null
          muscle_strength?: Json | null
          neurological_symptoms?: string[] | null
          pain_duration?: number | null
          pain_intensity?: number | null
          pain_location?:
            | Database["public"]["Enums"]["pain_location_type"]
            | null
          pain_pattern?: Database["public"]["Enums"]["pain_pattern_type"] | null
          physical_fitness_level?: number | null
          posture_assessment?: Json | null
          previous_injuries?: Json | null
          rom_limitations?: Json | null
          sleep_quality?: number | null
        }
        Update: {
          assessment_id?: string | null
          bmi?: number | null
          comorbidities?: string[] | null
          created_at?: string | null
          id?: string
          morning_stiffness?: number | null
          movement_patterns?: Json | null
          muscle_strength?: Json | null
          neurological_symptoms?: string[] | null
          pain_duration?: number | null
          pain_intensity?: number | null
          pain_location?:
            | Database["public"]["Enums"]["pain_location_type"]
            | null
          pain_pattern?: Database["public"]["Enums"]["pain_pattern_type"] | null
          physical_fitness_level?: number | null
          posture_assessment?: Json | null
          previous_injuries?: Json | null
          rom_limitations?: Json | null
          sleep_quality?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "biomedical_responses_assessment_id_fkey"
            columns: ["assessment_id"]
            isOneToOne: false
            referencedRelation: "patient_assessments"
            referencedColumns: ["id"]
          },
        ]
      }
      case_studies: {
        Row: {
          adl_problem: string | null
          age: number
          ai_analysis: string | null
          ai_role: string | null
          assessment_findings: string | null
          clinical_guidelines: Json | null
          clinical_reasoning_path: Json | null
          comorbidities: string | null
          condition: string | null
          created_at: string
          date: string
          evidence_levels: Json | null
          evidence_sources: Json | null
          gender: string
          generated_sections: Json | null
          icf_codes: Json | null
          id: string
          intervention_plan: string | null
          learning_objectives: Json | null
          medical_entities: Json | null
          medical_history: string | null
          medications: Json | null
          patient_background: string | null
          patient_name: string
          presenting_complaint: string | null
          psychosocial_factors: string | null
          reference_list: string | null
          smart_goals: Json | null
          specialization: string | null
          user_id: string | null
        }
        Insert: {
          adl_problem?: string | null
          age: number
          ai_analysis?: string | null
          ai_role?: string | null
          assessment_findings?: string | null
          clinical_guidelines?: Json | null
          clinical_reasoning_path?: Json | null
          comorbidities?: string | null
          condition?: string | null
          created_at?: string
          date: string
          evidence_levels?: Json | null
          evidence_sources?: Json | null
          gender: string
          generated_sections?: Json | null
          icf_codes?: Json | null
          id?: string
          intervention_plan?: string | null
          learning_objectives?: Json | null
          medical_entities?: Json | null
          medical_history?: string | null
          medications?: Json | null
          patient_background?: string | null
          patient_name: string
          presenting_complaint?: string | null
          psychosocial_factors?: string | null
          reference_list?: string | null
          smart_goals?: Json | null
          specialization?: string | null
          user_id?: string | null
        }
        Update: {
          adl_problem?: string | null
          age?: number
          ai_analysis?: string | null
          ai_role?: string | null
          assessment_findings?: string | null
          clinical_guidelines?: Json | null
          clinical_reasoning_path?: Json | null
          comorbidities?: string | null
          condition?: string | null
          created_at?: string
          date?: string
          evidence_levels?: Json | null
          evidence_sources?: Json | null
          gender?: string
          generated_sections?: Json | null
          icf_codes?: Json | null
          id?: string
          intervention_plan?: string | null
          learning_objectives?: Json | null
          medical_entities?: Json | null
          medical_history?: string | null
          medications?: Json | null
          patient_background?: string | null
          patient_name?: string
          presenting_complaint?: string | null
          psychosocial_factors?: string | null
          reference_list?: string | null
          smart_goals?: Json | null
          specialization?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      dutch_guidelines: {
        Row: {
          assessment_criteria: Json
          condition: string
          content: Json
          created_at: string | null
          embedding: string | null
          evidence_levels: Json
          exercise_recommendations: Json
          grade_evidence: Json
          id: string
          interventions: Json
          last_updated: string | null
          protocols: Json
          sections: Json
          title: string
          url: string
        }
        Insert: {
          assessment_criteria?: Json
          condition: string
          content?: Json
          created_at?: string | null
          embedding?: string | null
          evidence_levels?: Json
          exercise_recommendations?: Json
          grade_evidence?: Json
          id?: string
          interventions?: Json
          last_updated?: string | null
          protocols?: Json
          sections?: Json
          title: string
          url: string
        }
        Update: {
          assessment_criteria?: Json
          condition?: string
          content?: Json
          created_at?: string | null
          embedding?: string | null
          evidence_levels?: Json
          exercise_recommendations?: Json
          grade_evidence?: Json
          id?: string
          interventions?: Json
          last_updated?: string | null
          protocols?: Json
          sections?: Json
          title?: string
          url?: string
        }
        Relationships: []
      }
      ICF: {
        Row: {
          Activity_Description: string
          ICF_Categories: string
          ICF_Code: string
          Property: string
          Question: string
          Question_Alternative: string
          Row_ID: string
          Scale: string
          Scale_Type: string
        }
        Insert: {
          Activity_Description: string
          ICF_Categories: string
          ICF_Code: string
          Property: string
          Question: string
          Question_Alternative: string
          Row_ID: string
          Scale: string
          Scale_Type: string
        }
        Update: {
          Activity_Description?: string
          ICF_Categories?: string
          ICF_Code?: string
          Property?: string
          Question?: string
          Question_Alternative?: string
          Row_ID?: string
          Scale?: string
          Scale_Type?: string
        }
        Relationships: []
      }
      icf_codes: {
        Row: {
          activity_description: string
          icf_categories: string
          icf_code: string
          property: string
          question: string
          question_alternative: string
          row_id: number
          scale: string
          scale_type: string
        }
        Insert: {
          activity_description: string
          icf_categories: string
          icf_code: string
          property: string
          question: string
          question_alternative: string
          row_id: number
          scale: string
          scale_type: string
        }
        Update: {
          activity_description?: string
          icf_categories?: string
          icf_code?: string
          property?: string
          question?: string
          question_alternative?: string
          row_id?: number
          scale?: string
          scale_type?: string
        }
        Relationships: []
      }
      indicator_definitions: {
        Row: {
          category: string
          created_at: string | null
          description: string | null
          id: string
          max_value: number | null
          measurement_type: string
          min_value: number | null
          name: string
          unit: string | null
        }
        Insert: {
          category: string
          created_at?: string | null
          description?: string | null
          id?: string
          max_value?: number | null
          measurement_type: string
          min_value?: number | null
          name: string
          unit?: string | null
        }
        Update: {
          category?: string
          created_at?: string | null
          description?: string | null
          id?: string
          max_value?: number | null
          measurement_type?: string
          min_value?: number | null
          name?: string
          unit?: string | null
        }
        Relationships: []
      }
      lifestyle_tips: {
        Row: {
          actionable_tips: Json
          category: string
          content_embedding: string | null
          created_at: string
          description: string
          embedding: string | null
          fts: unknown | null
          id: string
          relevance_to_vision: string
          title: string
        }
        Insert: {
          actionable_tips: Json
          category: string
          content_embedding?: string | null
          created_at?: string
          description: string
          embedding?: string | null
          fts?: unknown | null
          id?: string
          relevance_to_vision: string
          title: string
        }
        Update: {
          actionable_tips?: Json
          category?: string
          content_embedding?: string | null
          created_at?: string
          description?: string
          embedding?: string | null
          fts?: unknown | null
          id?: string
          relevance_to_vision?: string
          title?: string
        }
        Relationships: []
      }
      messages: {
        Row: {
          content: string
          created_at: string
          id: string
          metadata: Json | null
          role: string
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          metadata?: Json | null
          role: string
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          metadata?: Json | null
          role?: string
          user_id?: string
        }
        Relationships: []
      }
      occupational_responses: {
        Row: {
          assessment_id: string | null
          created_at: string | null
          daily_activities_impact: number | null
          driving_ability: number | null
          ergonomic_factors: Json | null
          household_tasks_ability: number | null
          id: string
          job_physical_demands: Json | null
          lifting_capacity: number | null
          recreational_activities: string[] | null
          sick_leave_history: Json | null
          sitting_tolerance: number | null
          social_activity_levels: number | null
          sports_participation: Json | null
          standing_tolerance: number | null
          walking_capacity: number | null
          work_hours: number | null
          work_status: Database["public"]["Enums"]["work_status_type"] | null
        }
        Insert: {
          assessment_id?: string | null
          created_at?: string | null
          daily_activities_impact?: number | null
          driving_ability?: number | null
          ergonomic_factors?: Json | null
          household_tasks_ability?: number | null
          id?: string
          job_physical_demands?: Json | null
          lifting_capacity?: number | null
          recreational_activities?: string[] | null
          sick_leave_history?: Json | null
          sitting_tolerance?: number | null
          social_activity_levels?: number | null
          sports_participation?: Json | null
          standing_tolerance?: number | null
          walking_capacity?: number | null
          work_hours?: number | null
          work_status?: Database["public"]["Enums"]["work_status_type"] | null
        }
        Update: {
          assessment_id?: string | null
          created_at?: string | null
          daily_activities_impact?: number | null
          driving_ability?: number | null
          ergonomic_factors?: Json | null
          household_tasks_ability?: number | null
          id?: string
          job_physical_demands?: Json | null
          lifting_capacity?: number | null
          recreational_activities?: string[] | null
          sick_leave_history?: Json | null
          sitting_tolerance?: number | null
          social_activity_levels?: number | null
          sports_participation?: Json | null
          standing_tolerance?: number | null
          walking_capacity?: number | null
          work_hours?: number | null
          work_status?: Database["public"]["Enums"]["work_status_type"] | null
        }
        Relationships: [
          {
            foreignKeyName: "occupational_responses_assessment_id_fkey"
            columns: ["assessment_id"]
            isOneToOne: false
            referencedRelation: "patient_assessments"
            referencedColumns: ["id"]
          },
        ]
      }
      patient_assessments: {
        Row: {
          assessment_date: string | null
          created_at: string | null
          id: string
          user_id: string | null
        }
        Insert: {
          assessment_date?: string | null
          created_at?: string | null
          id?: string
          user_id?: string | null
        }
        Update: {
          assessment_date?: string | null
          created_at?: string | null
          id?: string
          user_id?: string | null
        }
        Relationships: []
      }
      posture_analysis: {
        Row: {
          analysis: string
          created_at: string
          id: string
          image_path: string
          tips: Json
          user_id: string | null
        }
        Insert: {
          analysis: string
          created_at?: string
          id?: string
          image_path: string
          tips?: Json
          user_id?: string | null
        }
        Update: {
          analysis?: string
          created_at?: string
          id?: string
          image_path?: string
          tips?: Json
          user_id?: string | null
        }
        Relationships: []
      }
      psychosocial_responses: {
        Row: {
          anxiety_levels: number | null
          assessment_id: string | null
          coping_strategies: string[] | null
          created_at: string | null
          depression_symptoms: number | null
          emotional_state: string | null
          family_dynamics: string | null
          fear_of_movement: number | null
          financial_stress: number | null
          id: string
          motivation_levels: number | null
          pain_beliefs: string[] | null
          pain_catastrophizing: number | null
          quality_of_life_impact: number | null
          recovery_beliefs: string | null
          self_efficacy: number | null
          social_support: number | null
          stress_levels: number | null
          treatment_expectations: string | null
          work_satisfaction: number | null
        }
        Insert: {
          anxiety_levels?: number | null
          assessment_id?: string | null
          coping_strategies?: string[] | null
          created_at?: string | null
          depression_symptoms?: number | null
          emotional_state?: string | null
          family_dynamics?: string | null
          fear_of_movement?: number | null
          financial_stress?: number | null
          id?: string
          motivation_levels?: number | null
          pain_beliefs?: string[] | null
          pain_catastrophizing?: number | null
          quality_of_life_impact?: number | null
          recovery_beliefs?: string | null
          self_efficacy?: number | null
          social_support?: number | null
          stress_levels?: number | null
          treatment_expectations?: string | null
          work_satisfaction?: number | null
        }
        Update: {
          anxiety_levels?: number | null
          assessment_id?: string | null
          coping_strategies?: string[] | null
          created_at?: string | null
          depression_symptoms?: number | null
          emotional_state?: string | null
          family_dynamics?: string | null
          fear_of_movement?: number | null
          financial_stress?: number | null
          id?: string
          motivation_levels?: number | null
          pain_beliefs?: string[] | null
          pain_catastrophizing?: number | null
          quality_of_life_impact?: number | null
          recovery_beliefs?: string | null
          self_efficacy?: number | null
          social_support?: number | null
          stress_levels?: number | null
          treatment_expectations?: string | null
          work_satisfaction?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "psychosocial_responses_assessment_id_fkey"
            columns: ["assessment_id"]
            isOneToOne: false
            referencedRelation: "patient_assessments"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      binary_quantize:
        | {
            Args: {
              "": string
            }
            Returns: unknown
          }
        | {
            Args: {
              "": unknown
            }
            Returns: unknown
          }
      gtrgm_compress: {
        Args: {
          "": unknown
        }
        Returns: unknown
      }
      gtrgm_decompress: {
        Args: {
          "": unknown
        }
        Returns: unknown
      }
      gtrgm_in: {
        Args: {
          "": unknown
        }
        Returns: unknown
      }
      gtrgm_options: {
        Args: {
          "": unknown
        }
        Returns: undefined
      }
      gtrgm_out: {
        Args: {
          "": unknown
        }
        Returns: unknown
      }
      halfvec_avg: {
        Args: {
          "": number[]
        }
        Returns: unknown
      }
      halfvec_out: {
        Args: {
          "": unknown
        }
        Returns: unknown
      }
      halfvec_send: {
        Args: {
          "": unknown
        }
        Returns: string
      }
      halfvec_typmod_in: {
        Args: {
          "": unknown[]
        }
        Returns: number
      }
      hnsw_bit_support: {
        Args: {
          "": unknown
        }
        Returns: unknown
      }
      hnsw_halfvec_support: {
        Args: {
          "": unknown
        }
        Returns: unknown
      }
      hnsw_sparsevec_support: {
        Args: {
          "": unknown
        }
        Returns: unknown
      }
      hnswhandler: {
        Args: {
          "": unknown
        }
        Returns: unknown
      }
      ivfflat_bit_support: {
        Args: {
          "": unknown
        }
        Returns: unknown
      }
      ivfflat_halfvec_support: {
        Args: {
          "": unknown
        }
        Returns: unknown
      }
      ivfflathandler: {
        Args: {
          "": unknown
        }
        Returns: unknown
      }
      l2_norm:
        | {
            Args: {
              "": unknown
            }
            Returns: number
          }
        | {
            Args: {
              "": unknown
            }
            Returns: number
          }
      l2_normalize:
        | {
            Args: {
              "": string
            }
            Returns: string
          }
        | {
            Args: {
              "": unknown
            }
            Returns: unknown
          }
        | {
            Args: {
              "": unknown
            }
            Returns: unknown
          }
      search_dutch_guidelines: {
        Args: {
          query_text: string
          query_embedding: string
          match_count?: number
          similarity_threshold?: number
        }
        Returns: {
          id: string
          title: string
          condition: string
          similarity: number
        }[]
      }
      search_lifestyle_tips: {
        Args: {
          query_text: string
          query_embedding: string
          match_count?: number
          similarity_threshold?: number
          full_text_weight?: number
          semantic_weight?: number
          rrf_k?: number
        }
        Returns: {
          id: string
          category: string
          title: string
          description: string
          actionable_tips: Json
          relevance_to_vision: string
          similarity: number
        }[]
      }
      search_medical_guidelines: {
        Args: {
          query_text: string
          query_embedding: string
          match_count?: number
          similarity_threshold?: number
          full_text_weight?: number
          semantic_weight?: number
        }
        Returns: {
          id: string
          title: string
          condition: string
          content: Json
          similarity: number
        }[]
      }
      set_limit: {
        Args: {
          "": number
        }
        Returns: number
      }
      show_limit: {
        Args: Record<PropertyKey, never>
        Returns: number
      }
      show_trgm: {
        Args: {
          "": string
        }
        Returns: string[]
      }
      sparsevec_out: {
        Args: {
          "": unknown
        }
        Returns: unknown
      }
      sparsevec_send: {
        Args: {
          "": unknown
        }
        Returns: string
      }
      sparsevec_typmod_in: {
        Args: {
          "": unknown[]
        }
        Returns: number
      }
      vector_avg: {
        Args: {
          "": number[]
        }
        Returns: string
      }
      vector_dims:
        | {
            Args: {
              "": string
            }
            Returns: number
          }
        | {
            Args: {
              "": unknown
            }
            Returns: number
          }
      vector_norm: {
        Args: {
          "": string
        }
        Returns: number
      }
      vector_out: {
        Args: {
          "": string
        }
        Returns: unknown
      }
      vector_send: {
        Args: {
          "": string
        }
        Returns: string
      }
      vector_typmod_in: {
        Args: {
          "": unknown[]
        }
        Returns: number
      }
    }
    Enums: {
      pain_location_type: "specific" | "diffuse" | "mixed"
      pain_pattern_type: "constant" | "intermittent" | "varying"
      scale_type: "difficulty" | "intensity" | "frequency" | "facbar"
      work_status_type:
        | "full_time"
        | "part_time"
        | "unemployed"
        | "modified_duties"
        | "sick_leave"
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
