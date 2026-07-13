import { NextResponse } from "next/server";
import { readData, writeData } from "@/utils/storage";

export async function POST(request, { params }) {
  try {
    const { id } = await params;

    const body = await request.json();

    const { planId, version } = body;


    if (!planId) {
      return NextResponse.json(
        {
          message: "Plan is required."
        },
        {
          status: 400
        }
      );
    }


    const subscriptions = readData("subscriptions.json") || [];
    const history = readData("history.json") || [];
    const plans = readData("plans.json") || [];


    // Validate requested plan

    const requestedPlan = plans.find(
      (plan) => plan.planId === planId
    );


    if (!requestedPlan) {
      return NextResponse.json(
        {
          message: "Invalid plan."
        },
        {
          status: 400
        }
      );
    }



    // Find subscription

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



    // Version checking

    if (
      version !== undefined &&
      version < subscription.version
    ) {
      return NextResponse.json(
        {
          message: "Old subscription version."
        },
        {
          status: 409
        }
      );
    }



    const status = subscription.status?.toLowerCase();



    // Status rules

    if (status === "cancelled") {
      return NextResponse.json(
        {
          message:
            "Cancelled subscriptions cannot change plans."
        },
        {
          status: 400
        }
      );
    }


    if (status === "paused") {
      return NextResponse.json(
        {
          message:
            "Resume subscription before changing plan."
        },
        {
          status: 400
        }
      );
    }



    const currentPlan = subscription.planId;



    if (currentPlan === planId) {
      return NextResponse.json(
        {
          message:
            "Already using this plan."
        },
        {
          status: 400
        }
      );
    }



    if (subscription.scheduledPlan === planId) {
      return NextResponse.json(
        {
          message:
            "This downgrade is already scheduled."
        },
        {
          status: 400
        }
      );
    }



    /*
       Plan priority

       FREE       = 0
       PRO        = 1
       BUSINESS   = 2

    */

    const planLevel = {
      FREE: 0,
      PRO: 1,
      BUSINESS: 2
    };


    const currentLevel =
      planLevel[currentPlan];


    const requestedLevel =
      planLevel[planId];



    let message;
    let effective;



    // Upgrade

    if (requestedLevel > currentLevel) {


      subscription.planId = planId;

      subscription.scheduledPlan = null;


      message =
        "Plan upgraded successfully.";


      effective =
        "Immediately";


      history.push({

        subscriptionId: id,

        action: "Plan Upgraded",

        fromPlan: currentPlan,

        toPlan: planId,

        status: subscription.status,

        version: subscription.version + 1,

        effective,

        date: new Date().toISOString()

      });


    }

    // Downgrade

    else {


      subscription.scheduledPlan = planId;


      message =
        "Downgrade scheduled.";


      effective =
        "Next Billing Period";



      history.push({

        subscriptionId: id,

        action: "Downgrade Scheduled",

        fromPlan: currentPlan,

        toPlan: planId,

        status: subscription.status,

        version: subscription.version + 1,

        effective,

        date: new Date().toISOString()

      });

    }



    subscription.version =
      (subscription.version || 0) + 1;



    writeData(
      "subscriptions.json",
      subscriptions
    );


    writeData(
      "history.json",
      history
    );



    return NextResponse.json({

      message,

      subscriptionId: id,

      currentPlan:
        subscription.planId,

      scheduledPlan:
        subscription.scheduledPlan,

      requestedPlan:
        planId,

      effective,

      status:
        subscription.status,

      version:
        subscription.version

    });



  } catch (error) {


    console.error(
      "Change plan error:",
      error
    );


    return NextResponse.json(
      {
        message:
          "Internal server error.",
        error:
          error.message
      },
      {
        status: 500
      }
    );

  }
}