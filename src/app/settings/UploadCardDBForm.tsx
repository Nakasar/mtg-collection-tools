"use client";

import { FormEvent, useRef, useState } from "react";
import { DocumentIcon } from "@heroicons/react/24/solid";
import { ArrowUpTrayIcon } from "@heroicons/react/24/outline";
import classNames from "@/helpers/class-name.helper";

export default function UploadCardDBForm() {
  const fileInput = useRef<HTMLInputElement>(null);
  const [fileSelected, setFileSelected] = useState(false);

  async function uploadCardDB(event?: FormEvent<HTMLFormElement>) {
    event?.preventDefault();

    console.log(fileInput.current?.files?.length);

    if (fileInput.current?.files?.length !== 1) {
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      console.log(event.target);
    };
    reader.readAsText(fileInput.current?.files?.[0]);
  }

  return (
    <form onSubmit={uploadCardDB}>
      <label htmlFor="cover-photo" className="block text-sm font-medium leading-6 text-gray-900">
        Importer la DB de cartes
      </label>
      <div className="mt-2 flex justify-center rounded-lg border border-dashed border-gray-900/25 px-6 py-10">
        <div className="text-center">
          <DocumentIcon className="mx-auto h-12 w-12 text-gray-300" aria-hidden="true" />
          <div className="mt-4 flex text-sm leading-6 text-gray-600">
            <label
              htmlFor="file-upload"
              className="relative cursor-pointer rounded-md bg-white font-semibold text-emerald-600 focus-within:outline-none focus-within:ring-2 focus-within:ring-emerald-600 focus-within:ring-offset-2 hover:text-emerald-500"
            >
              <span>Téléverser le fichier JSON</span>
              <input id="file-upload" name="file-upload" type="file" className="sr-only" ref={fileInput} onInput={() => setFileSelected(true)} />
            </label>
          </div>
          <p className="text-xs leading-5 text-gray-600">JSON, depuis <a href="https://scryfall.com/docs/api/bulk-data" target="_blank" referrerPolicy="no-referrer" className="text-emerald-500 hover:text-emerald-700 hover:underline">Scryfall</a>.</p>
        </div>
      </div>

      <button
        type="submit"
        className={classNames(
          fileSelected ? 'bg-emerald-600 hover:bg-emerald-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-600' : 'bg-gray-200 text-gray-400',
          "mt-2 inline-flex items-center justify-between gap-x-2 rounded-md px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm"
        )}
        disabled={!fileSelected}
      >
        Importer la base de données
        <ArrowUpTrayIcon className="-mr-0.5 h-5 w-5" aria-hidden="true" />
      </button>
    </form>
  );
}