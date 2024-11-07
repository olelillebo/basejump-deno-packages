import SupabaseClient from "https://esm.sh/v117/@supabase/supabase-js@2.21.0/dist/module/SupabaseClient.d.ts";
import { Database as BASEJUMP_DATABASE_SCHEMA } from "../types/basejump-database.ts";

export type BASEJUMP_BILLING_DATA_UPSERT = {
  provider: BASEJUMP_DATABASE_SCHEMA["basejump"]["Tables"]["billing_subscriptions"]["Row"]["provider"];
  customer?: {
    id: string;
    billing_email?: string;
    account_id: string;
    provider: string;
  };
  subscription?: {
    id: string;
    billing_customer_id?: string;
    status: BASEJUMP_DATABASE_SCHEMA["basejump"]["Tables"]["billing_subscriptions"]["Row"]["status"];
    account_id: string;
    created_at: Date;
    updated_at: Date;
    cancel_at?: Date;
    cancel_at_period_end?: boolean;
    canceled_at?: Date;
    current_period_end?: Date;
    current_period_start?: Date;
    ended_at?: Date;
    metadata?: {
      [key: string]: any;
    };
    price_id?: string;
    quantity?: number;
    trial_end?: Date;
    trial_start?: Date;
    plan_name?: string;
    plan_id?: string;
    provider: string;
  };
  product?: {
    id: string;
    name: string;
    description?: string;
    amount: number;
    currency: string;
    interval: "month" | "year" | "one_time";
    interval_count: 1;
    trial_period_days?: 30;
    active?: boolean;
    metadata?: {
      [key: string]: string;
    };
  };
};

export async function upsertCustomerSubscription(
  supabaseClient: SupabaseClient,
  accountId: string,
  upsertData: BASEJUMP_BILLING_DATA_UPSERT
) {
  const { data, error } = await supabaseClient.rpc(
    "service_role_upsert_customer_subscription",
    {
      account_id: accountId,
      customer: upsertData.customer,
      subscription: upsertData.subscription,
    }
  );

  if (error) {
    throw error;
  }

  return data;
}
