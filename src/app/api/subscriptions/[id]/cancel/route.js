import { NextResponse } from "next/server";
import { readData, writeData } from "@/utils/storage";

export async function POST(request, { params }) {
  const { id } = await params;
  const body = await request.json();

  const { cancelAtPeriodEnd, version } = body;

  const subscriptions = readData("subscriptions.json");
  const history = readData("history.json");

  const subscription = subscriptions.find(
    (sub) => sub.id === id
  );

  if (!subscription) {
    return NextResponse.json(
      {
        message: "Subscription not found.",
      },
      { status: 404 }
    );
  }

  // Reject stale requests
  if (
    version !== undefined &&
    version < subscription.version
  ) {
    return NextResponse.json(
      {
        message: "Older subscription version received.",
      },
      { status: 409 }
    );
  }

  // Already cancelled
  if (subscription.status === "cancelled") {
    return NextResponse.json(
      {
        message: "Subscription is already cancelled.",
      },
      { status: 400 }
    );
  }

  // Schedule cancellation
  if (cancelAtPeriodEnd) {

    if (subscription.cancelAtPeriodEnd) {
      return NextResponse.json(
        {
          message: "Cancellation already scheduled.",
        },
        { status: 400 }
      );
    }

    subscription.cancelAtPeriodEnd = true;

    history.push({
      subscriptionId: id,
      action: "Cancellation Scheduled",
      status: subscription.status,
      effectiveDate: subscription.currentPeriodEnd,
      version: subscription.version + 1,
      date: new Date().toISOString(),
    });

  }

  // Immediate cancellation
  else {

    const previousStatus = subscription.status;

    subscription.status = "cancelled";
    subscription.cancelAtPeriodEnd = false;

    history.push({
      subscriptionId: id,
      action: "Subscription Cancelled",
      previousStatus,
      status: "cancelled",
      version: subscription.version + 1,
      date: new Date().toISOString(),
    });

  }

  subscription.version++;

  writeData("subscriptions.json", subscriptions);
  writeData("history.json", history);

  return NextResponse.json({
    message: cancelAtPeriodEnd
      ? "Subscription will be cancelled at the end of the current billing period."
      : "Subscription cancelled immediately.",

    subscriptionId: id,

    status: subscription.status,

    cancelAtPeriodEnd: subscription.cancelAtPeriodEnd,

    effectiveDate: cancelAtPeriodEnd
      ? subscription.currentPeriodEnd
      : new Date().toISOString(),

    version: subscription.version,
  });
}