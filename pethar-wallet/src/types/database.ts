export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Currency =
  | 'AKD'
  | 'USD'
  | 'USDC'
  | 'USDT';

export type KycTier = 1 | 2;

export type UserStatus = 'ACTIVE' | 'SUSPENDED' | 'FROZEN' | 'CLOSED';

export type AccountType =
  | 'USER_WALLET'
  | 'AGENT_FLOAT'
  | 'RESERVE_VAULT'
  | 'FEE_INCOME'
  | 'COMMISSION_PAYABLE'
  | 'SUSPENSE';

export type TransactionType =
  | 'TRANSFER'
  | 'CASH_IN'
  | 'CASH_OUT'
  | 'POS_CHECKOUT'
  | 'CRYPTO_SWAP'
  | 'BINANCE_PAY_DEPOSIT'
  | 'MEXC_BRIDGE_DEPOSIT'
  | 'WISE_REMITTANCE'
  | 'CARD_TOPUP'
  | 'COMMISSION_PAYOUT'
  | 'OFFLINE_VOUCHER_ISSUE'
  | 'OFFLINE_VOUCHER_REDEEM'
  | 'REVERSAL'
  | 'ADJUSTMENT'
  | 'FX_CONVERSION';

export type TransactionStatus = 'PENDING' | 'SETTLED' | 'FAILED';

export type AgentStatus = 'ACTIVE' | 'SUSPENDED' | 'TERMINATED';

export type OtpPurpose =
  | 'CASH_IN'
  | 'CASH_OUT'
  | 'TRANSFER_CONFIRM'
  | 'LOGIN'
  | 'DEVICE_BINDING'
  | 'EMAIL_CHANGE'
  | 'PHONE_CHANGE'
  | 'PIN_RESET'
  | 'NAME_CHANGE';

export type OtpChannel = 'SMS' | 'PUSH' | 'TOTP' | 'EMAIL';

export type VoucherStatus = 'ISSUED' | 'REDEEMED' | 'EXPIRED' | 'VOID' | 'REVOKED';

export type PosTerminalStatus = 'ACTIVE' | 'SUSPENDED' | 'DECOMMISSIONED';

export type DefenseSeverity = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          username: string | null;
          uid: string | null;
          wallet_address: string | null;
          email: string | null;
          phone_number: string;
          first_name: string;
          last_name: string;
          full_name: string;
          nickname: string | null;
          national_id_no: string | null;
          dob: string | null;
          address: string | null;
          usd_account_wallet_address: string;
          pin_hash: string | null;
          avatar_url: string | null;
          kyc_tier: KycTier;
          status: UserStatus;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          username?: string | null;
          uid?: string | null;
          wallet_address?: string | null;
          email?: string | null;
          phone_number: string;
          first_name?: string;
          last_name?: string;
          full_name?: string;
          nickname?: string | null;
          national_id_no?: string | null;
          dob?: string | null;
          address?: string | null;
          usd_account_wallet_address?: string;
          pin_hash?: string | null;
          avatar_url?: string | null;
          kyc_tier?: KycTier;
          status?: UserStatus;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          username?: string | null;
          uid?: string | null;
          wallet_address?: string | null;
          email?: string | null;
          phone_number?: string;
          first_name?: string;
          last_name?: string;
          full_name?: string;
          nickname?: string | null;
          national_id_no?: string | null;
          dob?: string | null;
          address?: string | null;
          usd_account_wallet_address?: string;
          pin_hash?: string | null;
          avatar_url?: string | null;
          kyc_tier?: KycTier;
          status?: UserStatus;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      agents: {
        Row: {
          id: string;
          user_id: string;
          agent_code: string;
          display_name: string;
          commission_bps: number;
          parent_agent_id: string | null;
          status: AgentStatus;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          agent_code: string;
          display_name: string;
          commission_bps?: number;
          parent_agent_id?: string | null;
          status?: AgentStatus;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          agent_code?: string;
          display_name?: string;
          commission_bps?: number;
          parent_agent_id?: string | null;
          status?: AgentStatus;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'agents_user_id_fkey';
            columns: ['user_id'];
            isOneToOne: true;
            referencedRelation: 'users';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'agents_parent_agent_id_fkey';
            columns: ['parent_agent_id'];
            isOneToOne: false;
            referencedRelation: 'agents';
            referencedColumns: ['id'];
          }
        ];
      };
      accounts: {
        Row: {
          id: string;
          user_id: string | null;
          currency: Currency;
          account_type: AccountType;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id?: string | null;
          currency: Currency;
          account_type: AccountType;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string | null;
          currency?: Currency;
          account_type?: AccountType;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'accounts_user_id_fkey';
            columns: ['user_id'];
            isOneToOne: false;
            referencedRelation: 'users';
            referencedColumns: ['id'];
          }
        ];
      };
      transactions: {
        Row: {
          id: string;
          ref_id?: string;
          reference_id?: string;
          title?: string;
          title_mm?: string;
          category?: string;
          amount?: number;
          currency?: string;
          time?: string;
          status?: string;
          counterparty?: string;
          counterparty_mm?: string;
          fee?: number;
          hash?: string;
          transaction_type?: TransactionType;
          reverses_transaction_id?: string | null;
          metadata?: Json;
          created_at?: string;
          updated_at?: string;
        };
        Insert: {
          id?: string;
          ref_id?: string;
          reference_id?: string;
          title?: string;
          title_mm?: string;
          category?: string;
          amount?: number;
          currency?: string;
          time?: string;
          status?: string;
          counterparty?: string;
          counterparty_mm?: string;
          fee?: number;
          hash?: string;
          transaction_type?: TransactionType;
          reverses_transaction_id?: string | null;
          metadata?: Json;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          ref_id?: string;
          reference_id?: string;
          title?: string;
          title_mm?: string;
          category?: string;
          amount?: number;
          currency?: string;
          time?: string;
          status?: string;
          counterparty?: string;
          counterparty_mm?: string;
          fee?: number;
          hash?: string;
          transaction_type?: TransactionType;
          reverses_transaction_id?: string | null;
          metadata?: Json;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'transactions_reverses_transaction_id_fkey';
            columns: ['reverses_transaction_id'];
            isOneToOne: false;
            referencedRelation: 'transactions';
            referencedColumns: ['id'];
          }
        ];
      };
      user_profiles: {
        Row: {
          id: string;
          user_id: string | null;
          username: string;
          uid: string;
          wallet_address: string;
          name: string;
          first_name: string;
          last_name: string;
          nickname: string;
          email: string;
          phone: string;
          pin_hash: string | null;
          national_id_no: string;
          dob: string;
          address: string;
          usd_account_wallet_address: string;
          balance: number;
          akd_wallet_balance: number;
          usd_account_balance: number;
          total_balance: number;
          currency: string;
          avatar_url: string | null;
          kyc_tier: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id?: string | null;
          username?: string;
          uid?: string;
          wallet_address?: string;
          name?: string;
          first_name?: string;
          last_name?: string;
          nickname?: string;
          email?: string;
          phone?: string;
          pin_hash?: string | null;
          national_id_no?: string;
          dob?: string;
          address?: string;
          usd_account_wallet_address?: string;
          balance?: number;
          akd_wallet_balance?: number;
          usd_account_balance?: number;
          total_balance?: number;
          currency?: string;
          avatar_url?: string | null;
          kyc_tier?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string | null;
          username?: string;
          uid?: string;
          wallet_address?: string;
          name?: string;
          first_name?: string;
          last_name?: string;
          nickname?: string;
          email?: string;
          phone?: string;
          pin_hash?: string | null;
          national_id_no?: string;
          dob?: string;
          address?: string;
          usd_account_wallet_address?: string;
          balance?: number;
          akd_wallet_balance?: number;
          usd_account_balance?: number;
          total_balance?: number;
          currency?: string;
          avatar_url?: string | null;
          kyc_tier?: number;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'user_profiles_user_id_fkey';
            columns: ['user_id'];
            isOneToOne: false;
            referencedRelation: 'users';
            referencedColumns: ['id'];
          }
        ];
      };
      favorite_contacts: {
        Row: {
          id: string;
          user_id: string | null;
          name: string;
          username: string;
          uid: string;
          phone: string;
          initials: string;
          color_value: number;
          category: string;
          avatar_url: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id?: string | null;
          name: string;
          username: string;
          uid: string;
          phone?: string;
          initials?: string;
          color_value?: number;
          category?: string;
          avatar_url?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string | null;
          name?: string;
          username?: string;
          uid?: string;
          phone?: string;
          initials?: string;
          color_value?: number;
          category?: string;
          avatar_url?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };
      bill_providers: {
        Row: {
          id: string;
          biller_id: string;
          name: string;
          name_mm: string;
          category: string;
          region: string;
          account_label: string;
          default_account: string;
          is_popular: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          biller_id: string;
          name: string;
          name_mm: string;
          category: string;
          region: string;
          account_label: string;
          default_account: string;
          is_popular?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          biller_id?: string;
          name?: string;
          name_mm?: string;
          category?: string;
          region?: string;
          account_label?: string;
          default_account?: string;
          is_popular?: boolean;
          created_at?: string;
        };
        Relationships: [];
      };
      topup_packages: {
        Row: {
          id: string;
          operator: string;
          title: string;
          data_allowance: string;
          validity: string;
          cost_akd: number;
          is_best_seller: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          operator: string;
          title: string;
          data_allowance: string;
          validity: string;
          cost_akd: number;
          is_best_seller?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          operator?: string;
          title?: string;
          data_allowance?: string;
          validity?: string;
          cost_akd?: number;
          is_best_seller?: boolean;
          created_at?: string;
        };
        Relationships: [];
      };
      ledger_entries: {
        Row: {
          id: string;
          transaction_id: string;
          account_id: string;
          currency: Currency;
          amount: number;
          seq: number;
          balance_after: number;
          created_at: string;
          chain_hash: string | null;
        };
        Insert: {
          id?: string;
          transaction_id: string;
          account_id: string;
          currency: Currency;
          amount: number;
          seq: number;
          balance_after: number;
          created_at?: string;
          chain_hash?: string | null;
        };
        Update: {
          id?: string;
          transaction_id?: string;
          account_id?: string;
          currency?: Currency;
          amount?: number;
          seq?: number;
          balance_after?: number;
          created_at?: string;
          chain_hash?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: 'ledger_entries_account_id_fkey';
            columns: ['account_id'];
            isOneToOne: false;
            referencedRelation: 'accounts';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'ledger_entries_transaction_id_fkey';
            columns: ['transaction_id'];
            isOneToOne: false;
            referencedRelation: 'transactions';
            referencedColumns: ['id'];
          }
        ];
      };
      otp_challenges: {
        Row: {
          id: string;
          user_id: string | null;
          profile_id: string | null;
          purpose: OtpPurpose;
          code_hash: string;
          channel: OtpChannel;
          target_value: string | null;
          attempts: number;
          max_attempts: number;
          expires_at: string;
          consumed_at: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id?: string | null;
          profile_id?: string | null;
          purpose: OtpPurpose;
          code_hash: string;
          channel?: OtpChannel;
          target_value?: string | null;
          attempts?: number;
          max_attempts?: number;
          expires_at: string;
          consumed_at?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string | null;
          profile_id?: string | null;
          purpose?: OtpPurpose;
          code_hash?: string;
          channel?: OtpChannel;
          target_value?: string | null;
          attempts?: number;
          max_attempts?: number;
          expires_at?: string;
          consumed_at?: string | null;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'otp_challenges_user_id_fkey';
            columns: ['user_id'];
            isOneToOne: false;
            referencedRelation: 'users';
            referencedColumns: ['id'];
          }
        ];
      };
      name_change_reviews: {
        Row: {
          id: string;
          profile_id: string;
          user_id: string | null;
          old_first_name: string;
          old_last_name: string;
          new_first_name: string;
          new_last_name: string;
          reason: string;
          otp_verified: boolean;
          status: 'PENDING_REVIEW' | 'APPROVED' | 'REJECTED';
          reviewed_by: string | null;
          review_notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          profile_id: string;
          user_id?: string | null;
          old_first_name: string;
          old_last_name: string;
          new_first_name: string;
          new_last_name: string;
          reason?: string;
          otp_verified?: boolean;
          status?: 'PENDING_REVIEW' | 'APPROVED' | 'REJECTED';
          reviewed_by?: string | null;
          review_notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          profile_id?: string;
          user_id?: string | null;
          old_first_name?: string;
          old_last_name?: string;
          new_first_name?: string;
          new_last_name?: string;
          reason?: string;
          otp_verified?: boolean;
          status?: 'PENDING_REVIEW' | 'APPROVED' | 'REJECTED';
          reviewed_by?: string | null;
          review_notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      offline_vouchers: {
        Row: {
          id: string;
          voucher_code: string;
          owner_account_id: string;
          agent_id: string | null;
          currency: string;
          amount: number;
          issue_txn_id: string;
          redeem_txn_id: string | null;
          device_public_key: string;
          payload_signature: string;
          status: VoucherStatus;
          issued_at: string;
          expires_at: string;
          redeemed_at: string | null;
          offline_redeem_ref: string | null;
        };
        Insert: {
          id?: string;
          voucher_code: string;
          owner_account_id: string;
          agent_id?: string | null;
          currency: string;
          amount: number;
          issue_txn_id: string;
          redeem_txn_id?: string | null;
          device_public_key: string;
          payload_signature: string;
          status?: VoucherStatus;
          issued_at?: string;
          expires_at: string;
          redeemed_at?: string | null;
          offline_redeem_ref?: string | null;
        };
        Update: {
          id?: string;
          voucher_code?: string;
          owner_account_id?: string;
          agent_id?: string | null;
          currency?: string;
          amount?: number;
          issue_txn_id?: string;
          redeem_txn_id?: string | null;
          device_public_key?: string;
          payload_signature?: string;
          status?: VoucherStatus;
          issued_at?: string;
          expires_at?: string;
          redeemed_at?: string | null;
          offline_redeem_ref?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: 'offline_vouchers_owner_account_id_fkey';
            columns: ['owner_account_id'];
            isOneToOne: false;
            referencedRelation: 'accounts';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'offline_vouchers_agent_id_fkey';
            columns: ['agent_id'];
            isOneToOne: false;
            referencedRelation: 'agents';
            referencedColumns: ['id'];
          }
        ];
      };
      fx_rates: {
        Row: {
          id: string;
          base_currency: string;
          quote_currency: string;
          rate: number;
          source: string;
          spread_bps: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          base_currency: string;
          quote_currency: string;
          rate: number;
          source: string;
          spread_bps?: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          base_currency?: string;
          quote_currency?: string;
          rate?: number;
          source?: string;
          spread_bps?: number;
          created_at?: string;
        };
        Relationships: [];
      };
      pos_terminals: {
        Row: {
          id: string;
          terminal_code: string;
          merchant_user_id: string;
          store_name: string;
          store_name_mm: string | null;
          township: string;
          daily_sales_limit: number;
          status: PosTerminalStatus;
          created_at: string;
        };
        Insert: {
          id?: string;
          terminal_code: string;
          merchant_user_id: string;
          store_name: string;
          store_name_mm?: string | null;
          township: string;
          daily_sales_limit?: number;
          status?: PosTerminalStatus;
          created_at?: string;
        };
        Update: {
          id?: string;
          terminal_code?: string;
          merchant_user_id?: string;
          store_name?: string;
          store_name_mm?: string | null;
          township?: string;
          daily_sales_limit?: number;
          status?: PosTerminalStatus;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'pos_terminals_merchant_user_id_fkey';
            columns: ['merchant_user_id'];
            isOneToOne: false;
            referencedRelation: 'users';
            referencedColumns: ['id'];
          }
        ];
      };
      fx_rate_board: {
        Row: {
          id: string;
          pair: string;
          rate: number;
          spread_bps: number;
          provider: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          pair: string;
          rate: number;
          spread_bps?: number;
          provider?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          pair?: string;
          rate?: number;
          spread_bps?: number;
          provider?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      offline_signed_vouchers: {
        Row: {
          id: string;
          voucher_code: string;
          issuer_account_id: string;
          recipient_identifier: string;
          amount: number;
          currency: string;
          ed25519_signature: string;
          expires_at: string;
          redeemed_at: string | null;
          status: VoucherStatus;
          created_at: string;
        };
        Insert: {
          id?: string;
          voucher_code: string;
          issuer_account_id: string;
          recipient_identifier: string;
          amount: number;
          currency?: string;
          ed25519_signature: string;
          expires_at: string;
          redeemed_at?: string | null;
          status?: VoucherStatus;
          created_at?: string;
        };
        Update: {
          id?: string;
          voucher_code?: string;
          issuer_account_id?: string;
          recipient_identifier?: string;
          amount?: number;
          currency?: string;
          ed25519_signature?: string;
          expires_at?: string;
          redeemed_at?: string | null;
          status?: VoucherStatus;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'offline_signed_vouchers_issuer_account_id_fkey';
            columns: ['issuer_account_id'];
            isOneToOne: false;
            referencedRelation: 'accounts';
            referencedColumns: ['id'];
          }
        ];
      };
      cyber_defense_events: {
        Row: {
          id: string;
          event_type: string;
          severity: DefenseSeverity;
          ip_hash: string;
          details: Json;
          created_at: string;
        };
        Insert: {
          id?: string;
          event_type: string;
          severity: DefenseSeverity;
          ip_hash: string;
          details?: Json;
          created_at?: string;
        };
        Update: {
          id?: string;
          event_type?: string;
          severity?: DefenseSeverity;
          ip_hash?: string;
          details?: Json;
          created_at?: string;
        };
        Relationships: [];
      };
    };
    Views: {
      account_balances: {
        Row: {
          account_id: string;
          user_id: string | null;
          currency: Currency;
          account_type: AccountType;
          balance: number;
          last_seq: number;
          as_of: string;
        };
      };
    };
    Functions: {
      post_transaction: {
        Args: {
          p_reference_id: string;
          p_transaction_type: TransactionType;
          p_metadata?: Json;
          p_entries?: { account_id: string; amount: string | number }[] | Json;
        };
        Returns: string;
      };
    };
  };
}

export type User = Database['public']['Tables']['users']['Row'];
export type Account = Database['public']['Tables']['accounts']['Row'];
export type Transaction = Database['public']['Tables']['transactions']['Row'];
export type LedgerEntry = Database['public']['Tables']['ledger_entries']['Row'];
export type Agent = Database['public']['Tables']['agents']['Row'];
export type OtpChallenge = Database['public']['Tables']['otp_challenges']['Row'];
export type OfflineVoucher = Database['public']['Tables']['offline_vouchers']['Row'];
export type FxRate = Database['public']['Tables']['fx_rates']['Row'];
export type PosTerminal = Database['public']['Tables']['pos_terminals']['Row'];
export type FxRateBoard = Database['public']['Tables']['fx_rate_board']['Row'];
export type AccountBalance = Database['public']['Views']['account_balances']['Row'];
