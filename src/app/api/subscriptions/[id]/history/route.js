import { NextResponse } from "next/server";
import { readData } from "@/utils/storage";

export async function GET(request, { params }) {
  try {
    const { id } = await params;

    if (!id) {
      return NextResponse.json(
        {
          message: "Subscription ID is required."
        },
        {
          status: 400
        }
      );
    }


    const history = readData("history.json") || [];


    const subscriptionHistory = history
      .filter(
        (item) => item.subscriptionId === id
      )
      .sort(
        (a, b) =>
          new Date(b.date) -
          new Date(a.date)
      );


    return NextResponse.json({
      subscriptionId: id,
      count: subscriptionHistory.length,
      history: subscriptionHistory
    });


  } catch (error) {

    console.error(
      "Subscription history error:",
      error
    );


    return NextResponse.json(
      {
        message:
          "Failed to fetch subscription history."
      },
      {
        status: 500
      }
    );

  }
}