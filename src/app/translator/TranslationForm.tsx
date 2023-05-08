"use client";

import { ArrowRightIcon, ClipboardIcon } from "@heroicons/react/24/outline";
import {FormEvent, useState} from "react";

export default function TranslationForm() {
  const [cardListRaw, setCardListRaw] = useState<string>('');

  async function translateCardList(event?: FormEvent<HTMLFormElement>) {
    event?.preventDefault();

    console.log("translateCardList");

    const cardList = cardListRaw.split('\n');

    console.log({ cardList });
  }

  return (
    <form className="flex justify-between" onSubmit={translateCardList}>
      <textarea
        id="card-list"
        name="card-list"
        className="flex-grow block rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-emerald-600 sm:text-sm sm:leading-6"
        rows={20}
        value={cardListRaw}
        onChange={(event) => setCardListRaw(event.target.value)}
      ></textarea>

      <div className="flex flex-col justify-center px-4 space-y-2">
        <button
          type="submit"
          className="inline-flex items-center gap-x-2 rounded-md bg-emerald-600 px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-emerald-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-600"
        >
          Traduire
          <ArrowRightIcon className="-mr-0.5 h-5 w-5" aria-hidden="true" />
        </button>
        <button
          type="button"
          className="inline-flex items-center justify-between gap-x-2 rounded-md bg-emerald-600 px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-emerald-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-600"
        >
          Copier
          <ClipboardIcon className="-mr-0.5 h-5 w-5" aria-hidden="true" />
        </button>
      </div>

      <textarea
        className="flex-grow block rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-emerald-600 sm:text-sm sm:leading-6"
        rows={20}
        disabled
        value={"adazzd\nzadazd\nazdad"}
      ></textarea>
    </form>
  );
}