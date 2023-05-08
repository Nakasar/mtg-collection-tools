"use client";

import { useState } from "react";
import {ArrowPathIcon} from "@heroicons/react/24/outline";
import classNames from "@/helpers/class-name.helper";

export default function RefreshCardDBForm() {
  const [refreshing, setRefreshing] = useState(false);

  async function refreshCardDB() {
    setRefreshing(true);

    const response = await fetch("/api/settings/refresh-cards-db", {
      method: 'POST',
    });
  }

  return (
    <button
      type="submit"
      className={classNames(
        refreshing ? 'bg-gray-200 text-gray-400' : 'bg-emerald-600 hover:bg-emerald-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-600',
        "mt-2 inline-flex items-center justify-between gap-x-2 rounded-md px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm"
      )}
      onClick={refreshCardDB}
      disabled={refreshing}
    >
      Importer la base de données
      <ArrowPathIcon className="-mr-0.5 h-5 w-5" aria-hidden="true" />
    </button>
  );
}