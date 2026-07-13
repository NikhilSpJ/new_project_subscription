import { NextResponse } from "next/server";
import { readData, writeData } from "@/utils/storage";

export async function POST(request) {
  const body = await request.json();

  const {
    eventId,
    subscriptionId,
    version,
    status
  } = body;

  // Read JSON files
  const processedEvents = readData("billing-events.json");
  const subscriptions = readData("subscriptions.json");
  const history = readData("history.json");

  // Duplicate billing event
  if (processedEvents.find(event => event.eventId === eventId)) {
    return NextResponse.json(
      {
        message: "Duplicate billing event identifier."
      },
      { status: 409 }
    );
  }

  const subscription = subscriptions.find(
    sub => sub.id === subscriptionId
  );

  if (!subscription) {
    return NextResponse.json(
      {
        message: "Subscription not found."
      },
      { status: 404 }
    );
  }

  // Reject stale events
  if (
    version !== undefined &&
    version < subscription.version
  ) {
    return NextResponse.json(
      {
        message: "Older subscription version received."
      },
      { status: 409 }
    );
  }

  // Store billing event
  processedEvents.push({
    eventId,
    subscriptionId,
    version,
    status,
    processedAt: new Date().toISOString()
  });

  writeData("billing-events.json", processedEvents);

  // Billing Success
  if (status === "success") {

    subscription.status = "active";
    subscription.gracePeriodEnd = null;

    // Apply scheduled downgrade
    if (subscription.scheduledPlan) {
      history.push({
        subscriptionId,
        action: `Scheduled downgrade executed (${subscription.planId} → ${subscription.scheduledPlan})`,
        date: new Date().toISOString()
      });

      subscription.planId = subscription.scheduledPlan;
      subscription.scheduledPlan = null;
    }

    // Apply cancel at period end
    if (subscription.cancelAtPeriodEnd) {

      subscription.status = "cancelled";

      history.push({
        subscriptionId,
        action: "Subscription cancelled at period end",
        date: new Date().toISOString()
      });
    }

    history.push({
      subscriptionId,
      action: "Billing Successful",
      date: new Date().toISOString()
    });

  }

  // Billing Failed
  else {

    subscription.status = "past_due";

    const grace = new Date();
    grace.setDate(grace.getDate() + 3);

    subscription.gracePeriodEnd = grace.toISOString();

    history.push({
      subscriptionId,
      action: "Billing Failed",
      gracePeriodEnds: subscription.gracePeriodEnd,
      date: new Date().toISOString()
    });

  }

  subscription.version++;

  writeData("subscriptions.json", subscriptions);
  writeData("history.json", history);

  return NextResponse.json({
    message:
      status === "success"
        ? "Billing successful."
        : "Billing failed.",

    subscriptionId,

    subscriptionStatus: subscription.status,

    currentPlan: subscription.planId,

    scheduledPlan: subscription.scheduledPlan,

    cancelAtPeriodEnd: subscription.cancelAtPeriodEnd,

    gracePeriodEnd: subscription.gracePeriodEnd,

    version: subscription.version
  });
}