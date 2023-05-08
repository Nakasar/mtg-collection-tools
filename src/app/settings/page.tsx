import React from "react";
import UploadCardDBForm from "./UploadCardDBForm";

export default function Settings() {
  return (
    <div className="max-w-xl mx-auto">
      <h1 className="text-2xl font-semibold">Paramètres</h1>

      <UploadCardDBForm />
    </div>
  );
}