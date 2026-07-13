"use client";

import { useEffect, useState } from "react";

export default function Home() {
  const [subscription, setSubscription] = useState(null);
  const [error, setError] = useState("");


  useEffect(() => {

    fetch("/api/organizations/ORG-12/subscription")
      .then((res) => res.json())
      .then((data) => {

        if (data.message) {
          setError(data.message);
          return;
        }

        setSubscription(data);

      })
      .catch(() => {
        setError("Failed to load subscription.");
      });

  }, []);



  if (error) {
    return <p>{error}</p>;
  }


  if (!subscription) {
    return <p>Loading...</p>;
  }



  return (
    <main style={{ padding: "20px" }}>

      <h1>
        Subscription Dashboard
      </h1>



      <p>
        <b>Plan:</b> {subscription.planId}
      </p>



      <p>
        <b>Status:</b> {subscription.status}
      </p>



      <p>
        <b>Renewal:</b>{" "}
        {new Date(
          subscription.currentPeriodEnd
        ).toLocaleDateString()}
      </p>



      <p>
        <b>Projects:</b>{" "}
        {subscription.usage?.projectsUsed || 0}
        {" / "}
        {subscription.limits?.projects}
      </p>



      <p>
        <b>Team Members:</b>{" "}
        {subscription.usage?.teamMembersUsed || 0}
        {" / "}
        {subscription.limits?.teamMembers}
      </p>



      <p>
        <b>Features:</b>
      </p>


      <ul>
        {subscription.features?.map(
          (feature) => (
            <li key={feature}>
              {feature}
            </li>
          )
        )}
      </ul>


    </main>
  );
}