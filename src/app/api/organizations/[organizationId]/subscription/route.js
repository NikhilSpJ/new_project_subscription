import { NextResponse } from "next/server";
import { readData, writeData } from "@/utils/storage";

export async function GET(request, { params }) {
  const { organizationId } = await params;

  const subscriptions = readData("subscriptions.json");
  const plans = readData("plans.json");
  const usages = readData("usage.json");
  const history = readData("history.json");

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

  const usage =
    usages.find(
      (u) => u.organizationId === organizationId
    ) || {
      projectsUsed: 0,
      teamMembersUsed: 0,
    };

  // Remaining trial days
  let trialDaysRemaining = 0;

  if (subscription.status === "trialing") {
    const now = new Date();
    const trialEnd = new Date(subscription.currentPeriodEnd);

    trialDaysRemaining = Math.max(
      0,
      Math.ceil(
        (trialEnd - now) / (1000 * 60 * 60 * 24)
      )
    );
  }

  // Usage %
  const projectUsagePercentage =
    plan.limits.projects === -1
      ? null
      : Math.min(
          100,
          Math.round(
            (usage.projectsUsed /
              plan.limits.projects) *
              100
          )
        );

  const teamUsagePercentage =
    plan.limits.teamMembers === -1
      ? null
      : Math.min(
          100,
          Math.round(
            (usage.teamMembersUsed /
              plan.limits.teamMembers) *
              100
          )
        );

  return NextResponse.json({
    organizationId,

    subscriptionId: subscription.id,

    planId: subscription.planId,

    status: subscription.status,

    version: subscription.version,

    currentPeriodStart:
      subscription.currentPeriodStart,

    currentPeriodEnd:
      subscription.currentPeriodEnd,

    trialDaysRemaining,

    cancelAtPeriodEnd:
      subscription.cancelAtPeriodEnd,

    scheduledPlan:
      subscription.scheduledPlan,

    gracePeriodEnd:
      subscription.gracePeriodEnd,

    limits: {
      projects: plan.limits.projects === -1
        ? "Unlimited"
        : plan.limits.projects,

      teamMembers:
        plan.limits.teamMembers,
    },

    usage: {
      projectsUsed:
        usage.projectsUsed,

      teamMembersUsed:
        usage.teamMembersUsed,

      projectUsagePercentage,

      teamUsagePercentage,
    },

    features: plan.features,

    totalHistoryEvents:
      history.filter(
        (item) =>
          item.subscriptionId ===
          subscription.id
      ).length,
  });
}