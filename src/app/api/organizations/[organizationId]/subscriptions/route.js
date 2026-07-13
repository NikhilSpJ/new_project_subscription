import { NextResponse } from "next/server";
import { readData, writeData } from "@/utils/storage";

export async function POST(request, { params }) {
  const { organizationId } = await params;

  const subscriptions = readData("subscriptions.json");
  const history = readData("history.json");
  const usages = readData("usage.json");

  // Check if organization already has a subscription
  const existingSubscription = subscriptions.find(
    (sub) => sub.organizationId === organizationId
  );

  if (existingSubscription) {
    return NextResponse.json(
      {
        message: "Organization already has a subscription.",
      },
      { status: 409 }
    );
  }

  const now = new Date();

  const trialEnd = new Date(now);
  trialEnd.setDate(trialEnd.getDate() + 7);

  const subscription = {
    id: `SUB-${Date.now()}`,
    organizationId,
    planId: "FREE",
    status: "trialing",
    currentPeriodStart: now.toISOString(),
    currentPeriodEnd: trialEnd.toISOString(),
    cancelAtPeriodEnd: false,
    scheduledPlan: null,
    gracePeriodEnd: null,
    version: 1,
  };

  subscriptions.push(subscription);

  // Create initial usage record
  usages.push({
    organizationId,
    projectsUsed: 0,
    teamMembersUsed: 0,
  });

  // Create history
  history.push({
    subscriptionId: subscription.id,
    action: "Subscription Created",
    plan: "FREE",
    status: "trialing",
    version: 1,
    date: now.toISOString(),
  });

  history.push({
    subscriptionId: subscription.id,
    action: "7 Day Trial Started",
    plan: "FREE",
    status: "trialing",
    version: 1,
    date: now.toISOString(),
  });

  writeData("subscriptions.json", subscriptions);
  writeData("usage.json", usages);
  writeData("history.json", history);

  return NextResponse.json(
    {
      message: "Subscription created successfully.",

      subscription,

      summary: {
        trialDays: 7,
        renewalDate: trialEnd.toISOString(),
        currentPlan: "FREE",
        status: "trialing",
        version: subscription.version,
      },
    },
    { status: 201 }
  );
}