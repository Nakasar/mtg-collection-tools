'use client';

import {MeiliSearch} from "meilisearch";
import React, {FormEvent, useEffect, useState} from "react";
import {Combobox} from "@headlessui/react";
import {MagnifyingGlassIcon} from "@heroicons/react/20/solid";
import classNames from "@/helpers/class-name.helper";
import {ExclamationCircleIcon} from "@heroicons/react/24/outline";

const client = new MeiliSearch({
  host: 'http://127.0.0.1:7700',
});

type Card = {
  id: string;
  name: string;
  printed_name: string;
  image_uris: { small: string };
  collector_number: string;
  set: string;
  prices?: { eur: string; eur_foil: string };
};

export default function AddCardBar({ setCode, lang, addCard }: { setCode: string; lang: string; addCard: (({ setCode, collectorNumber }: { setCode: string; collectorNumber: string }) => Promise<void>) }) {
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [searchResults, setSearchResults] = useState<Card[]>([]);

  function handleSearch(event: FormEvent<HTMLFormElement>) {
    event?.preventDefault();
  }

  async function search(): Promise<Card[]> {
    const index = client.index<Card>('cards');

    const queryOptions: { filter: string[] } = { filter: [] };
    let queryString = "";

    if (searchQuery.includes(' lang:')) {

    } else if (lang !== 'en') {
      queryOptions.filter.push(
        `lang IN [en, ${lang}]`,
      );
    } else {
      queryOptions.filter.push(
        `lang IN [en]`,
      );
    }


    const setRegex = /(?: e|^e|^set| set):(?<set>[\w\*]+)/gm;
    const setResult = setRegex.exec(searchQuery);
    if (setResult?.groups?.set === '*') {
    } else if (setResult?.groups?.set) {
      queryOptions.filter.push(
        `set = ${setResult?.groups?.set}`,
      );
    } else {
      queryOptions.filter.push(
        `set = ${setCode}`,
      );
    }

    const queryNumber = parseInt(searchQuery);
    if (!isNaN(queryNumber)) {
      queryOptions.filter.push(
        `collector_number = ${queryNumber}`,
      );
    } else {
      queryString = searchQuery;
    }

    const result = await index.search(queryString, queryOptions);

    return result.hits;
  }

  function selectItem(item: Card) {
    console.log("selectItem", item);

    addCard({
      setCode: item.set,
      collectorNumber: item.collector_number,
    }).then(() => {
      setSearchQuery("");
    });
  }

  useEffect(() => {
    if (searchQuery.length > 0) {
      search().then(results => setSearchResults(results));
    } else {
      setSearchResults([]);
    }
  }, [searchQuery]);

  return (
    <div>
      <div
        className="divide-y divide-gray-100 overflow-hidden rounded-xl bg-white ring-1 ring-black ring-opacity-5 transition-all">
        <Combobox onChange={selectItem}>
          <div className="relative">
            <MagnifyingGlassIcon
              className="pointer-events-none absolute left-4 top-3.5 h-5 w-5 text-gray-400"
              aria-hidden="true"
            />
            <Combobox.Input
              className="h-12 w-full border-0 bg-transparent pl-11 pr-4 text-gray-900 placeholder:text-gray-400 focus:ring-0 sm:text-sm"
              placeholder="Rechercher..."
              onChange={(event) => setSearchQuery(event.target.value)}
              autoFocus
            />
          </div>

          {searchResults.length > 0 && (
            <Combobox.Options static className="max-h-96 scroll-py-3 overflow-y-auto p-3">
              {searchResults.map((item) => (
                <Combobox.Option
                  key={item.id}
                  value={item}
                  className={({active}) =>
                    classNames('flex cursor-default select-none rounded-xl p-3', active && 'bg-gray-100')
                  }
                >
                  {({active}) => (
                    <>
                      <div
                        className={classNames(
                          'flex h-10 w-10 flex-none items-center justify-center rounded-lg',
                        )}
                      >
                        <img alt={item.printed_name ?? item.name} src={item.image_uris?.small} className="h-12 text-white"
                             aria-hidden="true"/>
                      </div>
                      <div className="ml-4 flex-auto">
                        <p
                          className={classNames(
                            'text-sm font-medium',
                            active ? 'text-gray-900' : 'text-gray-700'
                          )}
                        >
                          {item.printed_name ?? item.name}
                        </p>
                        <p className={classNames('text-sm', active ? 'text-gray-700' : 'text-gray-500')}>
                          {item.set} #{item.collector_number} ({item.prices?.eur ?? '-'} €)
                        </p>
                      </div>
                    </>
                  )}
                </Combobox.Option>
              ))}
            </Combobox.Options>
          )}
          {searchQuery !== '' && searchResults.length === 0 && (
            <div className="px-6 py-14 text-center text-sm sm:px-14">
              <ExclamationCircleIcon
                type="outline"
                name="exclamation-circle"
                className="mx-auto h-6 w-6 text-gray-400"
              />
              <p className="mt-4 font-semibold text-gray-900">Aucun résultat</p>
              <p className="mt-2 text-gray-500">Aucun élément n&apos;a été trouvé avec cette recherche.</p>
            </div>
          )}
        </Combobox>
      </div>
    </div>
  );
}
