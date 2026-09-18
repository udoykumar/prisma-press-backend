import Stripe from "stripe";
import config from "../../config";
import { prisma } from "../../lib/prisma";
import stripe from "../../lib/stripe";
import {
  handleChangeSubscription,
  handleCheckoutCompleted,
} from "./subscription.utils";

// const createCheckoutSession = async (userId: string) => {
//   const transacrionResult = await prisma.$transaction(async (tx) => {
//     const user = await tx.user.findUniqueOrThrow({
//       where: {
//         id: userId,
//       },
//       include: {
//         subscription: true,
//       },
//     });

//     let stripeCustomerId = user.subscription?.stripeCustomerId;
//     if (!stripeCustomerId) {
//       const customer = await stripe.customers.create({
//         email: user.email,
//         name: user.name,
//         metadata: { userId: user.id },
//       });
//       stripeCustomerId = customer.id;
//     }

//     const session = await stripe.checkout.sessions.create({
//       line_items: [
//         {
//           price: config.stripe_product_id,
//           quantity: 1,
//         },
//       ],
//       mode: "subscription",
//       customer: stripeCustomerId,
//       payment_method_types: ["card"],
//       success_url: `${config.app_url}/premium?success=true`,
//       cancel_url: `${config.app_url}/payment?success=false`,
//       metadata: { userId: user.id },
//     });
//     return session.url;
//   });

//   return {
//     paymentUrl: transacrionResult,
//   };
// };

// const handleWebhook = async (payload: Buffer, signature: string) => {
//   const endPointSecret = config.stript_webhook_secret;
//   const event = stripe.webhooks.constructEvent(
//     payload,
//     signature,
//     endPointSecret,
//   );

//   //  Handle the event
//   switch (event.type) {
//     case "checkout.session.completed":
//       // console.log(event.data.object);

//       await handleCheckoutCompleted(event.data.object);
//       break;
//     case "customer.subscription.updated":
//       // Then define and call a method to handle the successful attachment of a PaymentMethod.
//       // handlePaymentMethodAttached(paymentMethod);
//       await handleChangeSubscription(event.data.object);
//       break;
//     case "customer.subscription.deleted":
//       await handleChangeSubscription(event.data.object);
//       break;
//     default:
//       // Unexpected event type
//       console.log(`No event match Unhandled event type ${event.type}.`);
//       break;
//   }
// };

const createCheckoutSession = async (userId: string) => {
  const transactionResult = await prisma.$transaction(async (tx) => {
    const user = await tx.user.findUniqueOrThrow({
      where: {
        id: userId,
      },
      include: {
        subscription: true,
      },
    });

    //old subscriber
    let stripeCustomerId = user.subscription?.stripeCustomerId;

    if (!stripeCustomerId) {
      // new subscriber
      const customer = await stripe.customers.create({
        email: user.email,
        name: user.name,
        metadata: { userId: user.id },
      });

      stripeCustomerId = customer.id;
    }

    const session = await stripe.checkout.sessions.create({
      line_items: [
        {
          price: config.stripe_product_id,
          quantity: 1,
        },
      ],
      mode: "subscription",
      customer: stripeCustomerId,
      payment_method_types: ["card"],
      success_url: `${config.app_url}/premium?success=true`,
      cancel_url: `${config.app_url}/payment?success=false`,
      metadata: { userId: user.id },
    });

    return session.url;
  });

  return {
    paymentUrl: transactionResult,
  };
};

const handleWebhook = async (payload: Buffer, signature: string) => {
  const endpointSecret = config.stripe_webhook_secret;
  const event = stripe.webhooks.constructEvent(
    payload,
    signature,
    endpointSecret,
  );

  // Handle the event
  switch (event.type) {
    case "checkout.session.completed":
      //Occurs when a Checkout Session has been successfully completed.
      // event.data.object
      await handleCheckoutCompleted(event.data.object);

      break;
    case "customer.subscription.updated":
      //Occurs whenever a subscription changes (e.g., switching from one plan to another, or changing the status from trial to active).
      await handleChangeSubscription(event.data.object);
      break;

    /*
            To test this run this command in terminal 
            stripe subscriptions cancel sub_1PsYourSubIdHere (paste existinmg subscribed sub id)
            */

    case "customer.subscription.deleted":
      //Occurs whenever a customer’s subscription ends
      await handleChangeSubscription(event.data.object);
      break;

    /*
       To test this run this command in terminal 
       stripe subscriptions cancel sub_1PsYourSubIdHere (paste existinmg subscribed sub id)
       */

    default:
      // Unexpected event type
      console.log(`No events matched. Unhandled event type ${event.type}.`);
      break;
  }
};

const getSubscriptionStatus = async (userId: string) => {
  const isSubscriptionExist = await prisma.subscription.findUniqueOrThrow({
    where: {
      userId,
    },
  });
  const isActive =
    isSubscriptionExist.status === "ACTIVE" &&
    isSubscriptionExist.currentPeriodEnd &&
    new Date(isSubscriptionExist.currentPeriodEnd) > new Date();

  return {
    status: isSubscriptionExist.status,
    isSubscribed: isActive,
    currentPeriodEnd: isSubscriptionExist.currentPeriodEnd,
  };
};

// const getPeriodEnd = (payload: Stripe.Subscription) => {
//   const cuuuentPeriodEndInMilliseconds =
//     payload.items.data[0]?.current_period_end;

//   const currentPeriodEnd = new Date(cuuuentPeriodEndInMilliseconds * 1000);
//   return currentPeriodEnd;
// };

// const handlecheckoutCompleted = async (session: Stripe.Checkout.Session) => {
//   const userId = session.metadata?.userId;
//   const stripeCustomerId = session.customer as string;
//   const stripeSubscriptionId = session.subscription as string;

//   if (!userId || !stripeSubscriptionId || !stripeCustomerId) {
//     throw new Error("webhook Failed");
//   }

//   const stripeSubscription =
//     await stripe.subscriptions.retrieve(stripeSubscriptionId);
//   // console.log("stripeSubscription", stripeSubscription.items.data[0]);
//   // const currentPeriodStart =
//   //   stripeSubscription.items.data[0]?.current_period_start;

//   const currentPeriodEnd = getPeriodEnd(stripeSubscription);
//   await prisma.subscription.upsert({
//     where: {
//       userId,
//     },
//     create: {
//       userId,
//       stripeCustomerId,
//       stripeSubscriptionId,
//       status: "ACTIVE",
//       currentPeriodEnd,
//     },
//     update: {
//       stripeCustomerId,
//       stripeSubscriptionId,
//       status: "ACTIVE",
//       currentPeriodEnd,
//     },
//   });
// };

// const handleChangeSubscription = (payload: Stripe.Subscription) => {
//   const stripeSubscription = payload.id;
//   const status = payload.status;
// };
export const subscriptionService = {
  createCheckoutSession,
  handleWebhook,
  getSubscriptionStatus,
};
