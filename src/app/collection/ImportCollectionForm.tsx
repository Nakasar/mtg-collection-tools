'use client';

import {FormEvent, useState} from "react";
import classNames from "@/helpers/class-name.helper";
import {ArrowDownTrayIcon} from "@heroicons/react/24/outline";
import {set} from "zod";

export default function ImportCollectionForm() {
  const [importing, setImporting] = useState<boolean>(false);

  async function importCollection(event?: FormEvent<HTMLFormElement>) {
    event?.preventDefault();

    setImporting(true);

    const formData = new FormData();
    formData.append('collection-file', event?.currentTarget.elements['collection-file'].files[0]);

    await fetch('/api/collection/imports', {
      method: 'POST',
      body: formData,
    });

    setImporting(false);
  }

  return (
    <>
      <form onSubmit={importCollection}>
        <div className="col-span-full">
          <div className="mt-2 flex justify-center rounded-lg border border-dashed border-gray-900/25 px-6 py-10">
            <div className="text-center">
              <ArrowDownTrayIcon className="mx-auto h-12 w-12 text-gray-300" aria-hidden="true" />
              <div className="mt-4 flex text-sm leading-6 text-gray-600">
                <label
                  htmlFor="collection-file"
                  className="relative cursor-pointer rounded-md bg-white font-semibold text-indigo-600 focus-within:outline-none focus-within:ring-2 focus-within:ring-indigo-600 focus-within:ring-offset-2 hover:text-indigo-500"
                >
                  <span>Choisir un fichier</span>
                  <input id="collection-file" name="collection-file" type="file" className="sr-only" />
                </label>
              </div>
              <p className="text-xs leading-5 text-gray-600">CSV, format MTG DragonShield</p>
            </div>
          </div>
        </div>

        <button
          type="submit"
          className={classNames(
            importing ? 'bg-emerald-100' : 'bg-emerald-600 hover:bg-emerald-500',
            "w-full mt-4 justify-center flex-grow inline-flex items-center gap-x-2 rounded-md px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-600"
          )}
          disabled={importing}
        >
          Importer
          <ArrowDownTrayIcon className="-mr-0.5 h-5 w-5" aria-hidden="true" />
        </button>
      </form>
    </>
  )
}
