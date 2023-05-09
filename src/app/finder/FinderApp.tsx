"use client";

import {FormEvent, useState} from "react";
import classNames from "@/helpers/class-name.helper";
import {ArrowRightIcon, DocumentMagnifyingGlassIcon} from "@heroicons/react/24/outline";

export default function FinderApp() {
  const [searching, setSearching] = useState<boolean>(false);
  const [cardListRaw, setCardListRaw] = useState<string>('');
  const [gotMatchResponse, setGotMatchResponse] = useState<boolean>(false);
  const [matchResponse, setMatchResponse] = useState<{
    card: {
      query: string;
      name: string;
      collectorNumber: string;
      set: string;
      setName: string;
      colors: string[];
    };
    collection: { quantity: number };
  }[]>([]);

  async function searchCollection(event?: FormEvent<HTMLFormElement>) {
    event?.preventDefault();

    setSearching(true);

    const res = await fetch('/api/collection/search', {
      method: 'POST',
      body: JSON.stringify({
        cards: cardListRaw.split('\n'),
      }),
    });

    setSearching(false);

    if (res.ok) {
      setMatchResponse(await res.json());

      setGotMatchResponse(true);
    }
  }

  return (
    <>
      {gotMatchResponse ? (
        <div>
          <div className="flex pt-4">
            <button
              className="bg-emerald-600 hover:bg-emerald-500 justify-center flex-grow inline-flex items-center gap-x-2 rounded-md px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-600"
              onClick={() => {
                setGotMatchResponse(false);
                setMatchResponse([]);
              }}
            >
              Nouvelle recherche
              <DocumentMagnifyingGlassIcon className="-mr-0.5 h-5 w-5" aria-hidden="true"/>
            </button>
          </div>

          <table className="min-w-full divide-y divide-gray-300">
            <thead>
              <tr>
                <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-0">
                  Recherche
                </th>
                <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-0">
                  Carte
                </th>
                <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-0">
                  Carte (anglais)
                </th>
                <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                  Quantité possédée
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {matchResponse.map((match) => (
                <tr key={match.card.name}>
                  <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-0">
                    {match.card.query}
                  </td>
                  <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{match.card.name}</td>
                  <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{match.card.name}</td>
                  <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{match.collection.quantity}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <form onSubmit={searchCollection}>
          <label htmlFor="card-list" className="text-sm text-gray-500 italic">
            Vous pouvez utiliser le format Scryfall (<kbd>e:MOM cn:50</kbd>) ou rechercher par nom de carte.
          </label>
          <textarea
            id="card-list"
            name="card-list"
            className="w-full block rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-emerald-600 sm:text-sm sm:leading-6"
            rows={20}
            value={cardListRaw}
            onChange={(event) => setCardListRaw(event.target.value)}
            disabled={searching}
          />

          <div className="flex pt-4">
            <button
              type="submit"
              className={classNames(
                searching ? 'bg-emerald-100' : 'bg-emerald-600 hover:bg-emerald-500',
                "justify-center flex-grow inline-flex items-center gap-x-2 rounded-md px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-600"
              )}
              disabled={searching}
            >
              Rechercher
              <DocumentMagnifyingGlassIcon className="-mr-0.5 h-5 w-5" aria-hidden="true"/>
            </button>
          </div>
        </form>
      )}
    </>
  );
}