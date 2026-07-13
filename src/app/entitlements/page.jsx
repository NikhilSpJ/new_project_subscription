"use client";

import { useState } from "react";

export default function Entitlements() {
  const [feature, setFeature] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);


  const checkFeature = async () => {

    if (!feature.trim()) return;


    try {

      setLoading(true);


      const res = await fetch(
        `/api/organizations/ORG-12/entitlements/${feature.trim()}`
      );


      const data = await res.json();


      if (!res.ok) {
        setResult({
          feature,
          allowed: false,
          reason:
            data.message || "Feature check failed."
        });

        return;
      }


      setResult(data);


    } catch (error) {

      setResult({
        feature,
        allowed: false,
        reason: "Server error."
      });


    } finally {

      setLoading(false);

    }
  };


  return (
    <main style={{ padding: 20 }}>

      <h1>Feature Access</h1>


      <input
        placeholder="Enter Feature"
        value={feature}
        onChange={(e) =>
          setFeature(e.target.value)
        }
      />


      <button
        style={{ marginLeft: 10 }}
        onClick={checkFeature}
        disabled={loading}
      >
        {loading ? "Checking..." : "Check"}
      </button>



      {result && (

        <div style={{ marginTop: 20 }}>

          <p>
            <strong>Feature:</strong>{" "}
            {result.feature}
          </p>


          <p>
            <strong>Allowed:</strong>{" "}
            {result.allowed ? "Yes" : "No"}
          </p>


          <p>
            <strong>Reason:</strong>{" "}
            {result.reason}
          </p>

        </div>

      )}

    </main>
  );
}