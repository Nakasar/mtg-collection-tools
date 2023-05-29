"use client";

import {useState} from "react";
import classNames from "@/helpers/class-name.helper";
import {ArrowDownTrayIcon, ArrowTopRightOnSquareIcon} from "@heroicons/react/24/outline";

export default function ExportCollection() {
  const [exporting, setExporting] = useState(false);

  async function exportToMoxfield() {
    setExporting(true);

    const response = await fetch('/api/collection/export?format=moxfield');

    if (response.ok) {
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      window.location.assign(url);
    }

    setExporting(false);
  }

  return (
    <>
      <button
        type="submit"
        className={classNames(
          exporting ? 'bg-emerald-100' : 'bg-emerald-600 hover:bg-emerald-500',
          "w-full mt-4 justify-center flex-grow inline-flex items-center gap-x-2 rounded-md px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-600"
        )}
        disabled={exporting}
        onClick={exportToMoxfield}
      >
        Exporter pour Moxfield (CSV)
        <ArrowTopRightOnSquareIcon className="-mr-0.5 h-5 w-5" aria-hidden="true" />
      </button>
    </>
  );
}