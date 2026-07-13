import { NextResponse } from "next/server";
import { readData } from "@/utils/storage";

export async function GET(request, { params }) {
  const { organizationId, feature } = await params;

  const subscriptions = readData("subscriptions.json");
  const plans = readData("plans.json");

  // Find subscription
  const subscription = subscriptions.find(
    (sub) => sub.organizationId === organizationId
  );

  if (!subscription) {
    return NextResponse.json(
      {
        message: "Subscription not found.",
      },
      { status: 404 }
    );
  }

  // Find plan
  const plan = plans.find(
    (p) => p.planId === subscription.planId
  );

  if (!plan) {
    return NextResponse.json(
      {
        message: "Plan not found.",
      },
      { status: 404 }
    );
  }

  // Cancelled
  if (subscription.status === "cancelled") {
    return NextResponse.json({
      organizationId,
      feature,
      allowed: false,
      reason: "Subscription cancelled.",
      status: subscription.status,
      version: subscription.version,
    });
  }

  // Paused
  if (subscription.status === "paused") {
    return NextResponse.json({
      organizationId,
      feature,
      allowed: false,
      reason: "Subscription paused.",
      status: subscription.status,
      version: subscription.version,
    });
  }

  // Past Due (Grace Period Check)
  if (subscription.status === "past_due") {

    if (subscription.gracePeriodEnd) {

      const now = new Date();
      const graceEnd = new Date(subscription.gracePeriodEnd);

      if (now > graceEnd) {
        return NextResponse.json({
          organizationId,
          feature,
          allowed: false,
          reason: "Grace period expired.",
          status: subscription.status,
          gracePeriodEnd: subscription.gracePeriodEnd,
          version: subscription.version,
        });
      }
    }
  }

  // Check feature availability
  const allowed = plan.features.includes(feature);

  return NextResponse.json({
    organizationId,
    feature,
    allowed,
    plan: subscription.planId,
    status: subscription.status,
    version: subscription.version,
    gracePeriodEnd: subscription.gracePeriodEnd,
    reason: allowed
      ? "Feature available."
      : "Feature not included in your plan.",
  });
}