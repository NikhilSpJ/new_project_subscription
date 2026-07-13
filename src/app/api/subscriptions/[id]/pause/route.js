import { NextResponse } from "next/server";
import { readData, writeData } from "@/utils/storage";

export async function POST(request, { params }) {
  try {
    const { id } = await params;


    const subscriptions =
      readData("subscriptions.json") || [];

    const history =
      readData("history.json") || [];



    const subscription = subscriptions.find(
      (sub) => sub.id === id
    );


    if (!subscription) {
      return NextResponse.json(
        {
          message: "Subscription not found."
        },
        {
          status: 404
        }
      );
    }



    if (
      subscription.status?.toLowerCase() !== "active"
    ) {
      return NextResponse.json(
        {
          message:
            "Only active subscriptions can be paused."
        },
        {
          status: 400
        }
      );
    }



    subscription.status = "paused";

    subscription.version =
      (subscription.version || 0) + 1;



    history.push({

      subscriptionId: id,

      action: "Subscription Paused",

      status: subscription.status,

      version: subscription.version,

      date: new Date().toISOString()

    });



    writeData(
      "subscriptions.json",
      subscriptions
    );


    writeData(
      "history.json",
      history
    );



    return NextResponse.json({

      message:
        "Subscription paused successfully.",

      subscriptionId: id,

      status:
        subscription.status,

      version:
        subscription.version

    });



  } catch (error) {

    console.error(
      "Pause subscription error:",
      error
    );


    return NextResponse.json(
      {
        message:
          "Failed to pause subscription."
      },
      {
        status: 500
      }
    );

  }
}