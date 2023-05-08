import React from "react";
import RefreshCardDBForm from "./RefreshCardDBForm";

export default function Settings() {
  return (
    <div className="max-w-xl mx-auto">
      <h1 className="text-2xl font-semibold">Paramètres</h1>

      <RefreshCardDBForm />
    </div>
  );
}