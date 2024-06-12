import React from "react";
import RefreshCardDBForm from "./RefreshCardDBForm";
import {refreshCardPrices} from "@/app/settings/actions";

export default function Settings() {
  return (
    <div className="max-w-xl mx-auto">
      <h1 className="text-2xl font-semibold">Paramètres</h1>

      <RefreshCardDBForm />

      <form action={refreshCardPrices}>
        <input
          type="submit"
          className="cursor-pointer bg-emerald-600 hover:bg-emerald-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-600 mt-2 inline-flex items-center justify-between gap-x-2 rounded-md px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm"
          value="Actualiser les prix"
        />
      </form>
    </div>
  );
}