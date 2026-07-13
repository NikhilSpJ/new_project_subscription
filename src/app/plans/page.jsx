"use client";

import { useState } from "react";

export default function Plans() {
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);


  const changePlan = async (planId) => {

    try {

      setLoading(true);


      const res = await fetch(
        "/api/subscriptions/SUB-900/change-plan",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            planId
          }),
        }
      );


      const data = await res.json();


      if (!res.ok) {
        setMessage(
          data.message || "Failed to change plan."
        );

        return;
      }


      setMessage(
        `${data.message} 
        Current: ${data.currentPlan}
        ${
          data.scheduledPlan
            ? `Scheduled: ${data.scheduledPlan}`
            : ""
        }`
      );


    } catch (error) {

      setMessage(
        "Something went wrong."
      );


    } finally {

      setLoading(false);

    }

  };



  return (
    <main style={{ padding: 20 }}>

      <h1>
        Subscription Plans
      </h1>


      <button
        onClick={() => changePlan("FREE")}
        disabled={loading}
      >
        FREE
      </button>



      <button
        style={{ marginLeft: 10 }}
        onClick={() => changePlan("PRO")}
        disabled={loading}
      >
        PRO
      </button>



      <button
        style={{ marginLeft: 10 }}
        onClick={() => changePlan("BUSINESS")}
        disabled={loading}
      >
        BUSINESS
      </button>



      <p>
        {loading ? "Updating..." : message}
      </p>


    </main>
  );
}