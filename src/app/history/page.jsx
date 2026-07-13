"use client";

import { useEffect, useState } from "react";

export default function History() {
  const [history, setHistory] = useState([]);


  useEffect(() => {

    fetch("/api/subscriptions/SUB-900/history")
      .then((res) => res.json())
      .then((data) => {

        if (data.history) {
          setHistory(data.history);
        }

      })
      .catch((error) => {
        console.error(
          "History fetch error:",
          error
        );
      });

  }, []);



  return (
    <main style={{ padding: 20 }}>

      <h1>
        Subscription History
      </h1>


      {history.length === 0 && (
        <p>
          No history found.
        </p>
      )}



      <ul>

        {history.map((item, index) => (

          <li key={index}>

            <strong>
              {item.action}
            </strong>



            {item.fromPlan && (
              <>
                {" "}
                ({item.fromPlan} → {item.toPlan})
              </>
            )}


            <br />


            Status: {item.status}


            <br />


            {new Date(item.date)
              .toLocaleString()}

          </li>

        ))}

      </ul>

    </main>
  );
}