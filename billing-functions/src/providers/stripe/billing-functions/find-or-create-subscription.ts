import { Stripe } from "../../../../deps.ts";
import { stripeSubscriptionToBasejumpSubscription } from "./stripe-utils.ts";
import { BASEJUMP_BILLING_DATA_UPSERT } from "../../../../lib/upsert-data.ts";

export async function findOrCreateSubscription(
  stripeClient: Stripe.Client,
  { customerId, subscriptionId, accountId, defaultPlanId, defaultTrialDays }
): Promise<BASEJUMP_BILLING_DATA_UPSERT["subscription"]> {
  console.log("test",subscriptionId)
  if (!customerId) {
    throw new Error("customerId is required");
  }

  // if we have the subscription ID, we can just return it
  if (subscriptionId) {
    const subscription = await stripeClient.subscriptions.retrieve(
      subscriptionId
    );
    const product = await stripeClient.products.retrieve(
      subscription.items.data[0].plan.product as string
    );
    if (subscription) {
      return stripeSubscriptionToBasejumpSubscription(
        accountId,
        subscription,
        product
      );
    }
  }

  if (!customerId) {
    throw new Error("customerId is required");
  }

  //If we don't have it, we can search for the metadata
  const customerSubscriptions = await stripeClient.subscriptions.list({
    customer: customerId,
  });
console.log("customerSubscriptions.data.length",customerSubscriptions.data.length)
  if (customerSubscriptions.data.length > 0) {
    // check to see if we have any that are for this account
    const subscription = customerSubscriptions.data.find(
      (s) => s.metadata?.basejump_account_id === accountId
    );
    const product = await stripeClient.products.retrieve(
      subscription.items.data[0].plan.product as string
    );
    if (subscription) {
      console.log("subscription found")

      return stripeSubscriptionToBasejumpSubscription(
        accountId,
        subscription,
        product
      );
    }
  }

  // nope, so we need to try and create it
  if (!defaultPlanId) {
          console.log("No default plan id")

    return;
  }

  const priceList = await stripeClient.prices.list();
  console.log("priceList",priceList)

  if (priceList.data.length > 0) {
    // check to see if we have any that are for this account
    const price = priceList.data.find(
      (s) => s.product === defaultPlanId
    );

      console.log("price",price)


    // if the price doesn't exist, or price is not free and there is no trial period, return
    // this is because we can't create the subscription without a payment method
    if (!price || (price.unit_amount > 0 && !defaultTrialDays)) {
            console.log("no price")

      return;
    }

     const newSubscription = await stripeClient.subscriptions.create({
    customer: customerId,
    items: [{ price: price.id }],
    expand: ["latest_invoice.payment_intent"],
    trial_period_days: Number(defaultTrialDays),
    metadata: {
      basejump_account_id: accountId,
    },
  });
                console.log("newSubscription",newSubscription)

  const product = await stripeClient.products.retrieve(
    newSubscription.items.data[0].plan.product as string
  );

  return stripeSubscriptionToBasejumpSubscription(
    accountId,
    newSubscription,
    product
  );
  }
    

}
