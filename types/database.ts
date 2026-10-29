export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type TournamentFormat =
  | 'swiss'
  | 'round_robin'
  | 'double_round_robin'
  | 'knockout'
  | 'double_elimination'
  | 'arena'
  | 'scheveningen'
  | 'team_swiss';

export type TournamentStatus =
  | 'draft'
  | 'registration'
  | 'running'
  | 'finished'
  | 'cancelled';

export type TournamentVisibility = 'public' | 'unlisted' | 'private';

export type GameResult =
  | 'white_win'
  | 'black_win'
  | 'draw'
  | 'white_forfeit_win'
  | 'black_forfeit_win'
  | 'double_forfeit'
  | 'bye'
  | 'unplayed';

export type PlayerStatus = 'active' | 'withdrawn';

export type RoundStatus = 'draft' | 'published' | 'completed';

export interface TournamentSettings {
  winPoints: number;
  drawPoints: number;
  byePoints: number;
  firstRound: 'random' | 'seeded';
  tieBreaks: Array<'buchholz' | 'buchholz_cut1' | 'median_buchholz' | 'sonneborn_berger' | 'wins' | 'direct_encounter'>;
  allowLateEntry: boolean;
  registrationToken?: string;
  registrationOpen?: boolean;
  requireCheckIn?: boolean;
  allowSelfCheckIn?: boolean;
  roundPairingMethods?: Record<string, string>;
  checkedInPlayerIds?: string[];
  pendingRegistrations?: any[];
}

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          display_name: string | null;
          avatar_url: string | null;
          created_at: string;
        };
        Insert: {
          id: string;
          display_name?: string | null;
          avatar_url?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          display_name?: string | null;
          avatar_url?: string | null;
          created_at?: string;
        };
      };
      tournaments: {
        Row: {
          id: string;
          owner_id: string;
          slug: string;
          name: string;
          description: string | null;
          format: TournamentFormat;
          status: TournamentStatus;
          visibility: TournamentVisibility;
          total_rounds: number;
          current_round: number;
          time_control: string | null;
          venue: string | null;
          start_date: string | null;
          settings: TournamentSettings;
          created_at: string;
        };
        Insert: {
          id?: string;
          owner_id: string;
          slug: string;
          name: string;
          description?: string | null;
          format: TournamentFormat;
          status?: TournamentStatus;
          visibility?: TournamentVisibility;
          total_rounds: number;
          current_round?: number;
          time_control?: string | null;
          venue?: string | null;
          start_date?: string | null;
          settings?: TournamentSettings;
          created_at?: string;
        };
        Update: {
          id?: string;
          owner_id?: string;
          slug?: string;
          name?: string;
          description?: string | null;
          format?: TournamentFormat;
          status?: TournamentStatus;
          visibility?: TournamentVisibility;
          total_rounds?: number;
          current_round?: number;
          time_control?: string | null;
          venue?: string | null;
          start_date?: string | null;
          settings?: TournamentSettings;
          created_at?: string;
        };
      };
      tournament_members: {
        Row: {
          tournament_id: string;
          user_id: string;
          role: string;
          created_at: string;
        };
        Insert: {
          tournament_id: string;
          user_id: string;
          role?: string;
          created_at?: string;
        };
        Update: {
          tournament_id?: string;
          user_id?: string;
          role?: string;
          created_at?: string;
        };
      };
      teams: {
        Row: {
          id: string;
          tournament_id: string;
          name: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          tournament_id: string;
          name: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          tournament_id?: string;
          name?: string;
          created_at?: string;
        };
      };
      players: {
        Row: {
          id: string;
          tournament_id: string;
          user_id: string | null;
          team_id: string | null;
          name: string;
          rating: number | null;
          club: string | null;
          seed: number | null;
          status: PlayerStatus;
          checked_in: boolean;
          withdrawn_after_round: number | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          tournament_id: string;
          user_id?: string | null;
          team_id?: string | null;
          name: string;
          rating?: number | null;
          club?: string | null;
          seed?: number | null;
          status?: PlayerStatus;
          checked_in?: boolean;
          withdrawn_after_round?: number | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          tournament_id?: string;
          user_id?: string | null;
          team_id?: string | null;
          name?: string;
          rating?: number | null;
          club?: string | null;
          seed?: number | null;
          status?: PlayerStatus;
          checked_in?: boolean;
          withdrawn_after_round?: number | null;
          created_at?: string;
        };
      };
      rounds: {
        Row: {
          id: string;
          tournament_id: string;
          number: number;
          status: RoundStatus;
          bracket: string | null;
          pairing_method: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          tournament_id: string;
          number: number;
          status?: RoundStatus;
          bracket?: string | null;
          pairing_method?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          tournament_id?: string;
          number?: number;
          status?: RoundStatus;
          bracket?: string | null;
          pairing_method?: string | null;
          created_at?: string;
        };
      };
      games: {
        Row: {
          id: string;
          tournament_id: string;
          round_id: string;
          board: number;
          white_id: string | null;
          black_id: string | null;
          result: GameResult;
          pgn: string | null;
          played_at: string | null;
        };
        Insert: {
          id?: string;
          tournament_id: string;
          round_id: string;
          board: number;
          white_id?: string | null;
          black_id?: string | null;
          result?: GameResult;
          pgn?: string | null;
          played_at?: string | null;
        };
        Update: {
          id?: string;
          tournament_id?: string;
          round_id?: string;
          board?: number;
          white_id?: string | null;
          black_id?: string | null;
          result?: GameResult;
          pgn?: string | null;
          played_at?: string | null;
        };
      };
      tournament_registrations: {
        Row: {
          id: string;
          tournament_id: string;
          name: string;
          rating: number | null;
          club: string | null;
          email: string | null;
          phone: string | null;
          notes: string | null;
          status: 'pending' | 'approved' | 'rejected';
          created_at: string;
        };
        Insert: {
          id?: string;
          tournament_id: string;
          name: string;
          rating?: number | null;
          club?: string | null;
          email?: string | null;
          phone?: string | null;
          notes?: string | null;
          status?: 'pending' | 'approved' | 'rejected';
          created_at?: string;
        };
        Update: {
          id?: string;
          tournament_id?: string;
          name?: string;
          rating?: number | null;
          club?: string | null;
          email?: string | null;
          phone?: string | null;
          notes?: string | null;
          status?: 'pending' | 'approved' | 'rejected';
          created_at?: string;
        };
      };
    };
    Views: Record<string, never>;
    Functions: {
      is_tournament_admin: {
        Args: { t_id: string };
        Returns: boolean;
      };
    };
    Enums: {
      tournament_format: TournamentFormat;
      tournament_status: TournamentStatus;
      visibility: TournamentVisibility;
      game_result: GameResult;
      player_status: PlayerStatus;
      round_status: RoundStatus;
    };
    CompositeTypes: Record<string, never>;
  };
}
