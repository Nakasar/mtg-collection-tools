"use client";

import React, {FormEvent, Fragment, ReactNode, useEffect, useState} from 'react'
import {Combobox, Menu, Transition} from '@headlessui/react'
import {
  Bars3Icon,
  BellIcon, ExclamationCircleIcon,
} from '@heroicons/react/24/outline'
import { ChevronDownIcon, MagnifyingGlassIcon } from '@heroicons/react/20/solid'
import classNames from "@/helpers/class-name.helper";
import {MeiliSearch} from "meilisearch";

const userNavigation = [
  { name: 'Your profile', href: '#' },
  { name: 'Sign out', href: '#' },
];

type Card = {
  id: string;
  name: string;
  printed_name: string;
  image_uris: { small: string };
  collector_number: string;
};

const client = new MeiliSearch({
  host: 'http://127.0.0.1:7700',
});

export default function SearchBar({ setSidebarOpen, children }: { setSidebarOpen: Function; children: ReactNode }) {
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [searchResults, setSearchResults] = useState<Card[]>([]);

  function handleSearch(event: FormEvent<HTMLFormElement>) {
    event?.preventDefault();
  }

  async function search(): Promise<Card[]> {
    const index = client.index<Card>('cards');
    const result = await index.search(searchQuery);

    return result.hits;
  }

  function selectItem(item: Card) {
    console.log("selectItem", item);

    setSearchQuery("");
  }

  useEffect(() => {
    if (searchQuery.length > 0) {
      search().then(results => setSearchResults(results));
    } else {
      setSearchResults([]);
    }
  }, [searchQuery])

  return (
    <div className="lg:pl-72">
      <div className="sticky top-0 z-40 flex h-16 shrink-0 items-center gap-x-4 border-b border-gray-200 bg-white px-4 shadow-sm sm:gap-x-6 sm:px-6 lg:px-8">
        <button type="button" className="-m-2.5 p-2.5 text-gray-700 lg:hidden" onClick={() => setSidebarOpen(true)}>
          <span className="sr-only">Open sidebar</span>
          <Bars3Icon className="h-6 w-6" aria-hidden="true" />
        </button>

        {/* Separator */}
        <div className="h-6 w-px bg-gray-900/10 lg:hidden" aria-hidden="true" />

        <div className="flex flex-1 gap-x-4 self-stretch lg:gap-x-6">
          <div className="z-10 flex-grow">
            <div className="divide-y divide-gray-100 overflow-hidden rounded-xl bg-white ring-1 ring-black ring-opacity-5 transition-all">
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
                  />
                </div>

                {searchResults.length > 0 && (
                  <Combobox.Options static className="max-h-96 scroll-py-3 overflow-y-auto p-3">
                    {searchResults.map((item) => (
                      <Combobox.Option
                        key={item.id}
                        value={item}
                        className={({ active }) =>
                          classNames('flex cursor-default select-none rounded-xl p-3', active && 'bg-gray-100')
                        }
                      >
                        {({ active }) => (
                          <>
                            <div
                              className={classNames(
                                'flex h-10 w-10 flex-none items-center justify-center rounded-lg',
                              )}
                            >
                              <img alt={item.printed_name} src={item.image_uris?.small} className="h-12 text-white" aria-hidden="true" />
                            </div>
                            <div className="ml-4 flex-auto">
                              <p
                                className={classNames(
                                  'text-sm font-medium',
                                  active ? 'text-gray-900' : 'text-gray-700'
                                )}
                              >
                                {item.printed_name}
                              </p>
                              <p className={classNames('text-sm', active ? 'text-gray-700' : 'text-gray-500')}>
                                {item.collector_number}
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
                    <p className="mt-2 text-gray-500">Aucun élément n'a été trouvé avec cette recherche.</p>
                  </div>
                )}
              </Combobox>
            </div>
          </div>

          <div className="flex items-center gap-x-4 lg:gap-x-6">
            <button type="button" className="-m-2.5 p-2.5 text-gray-400 hover:text-gray-500">
              <span className="sr-only">View notifications</span>
              <BellIcon className="h-6 w-6" aria-hidden="true" />
            </button>

            {/* Separator */}
            <div className="hidden lg:block lg:h-6 lg:w-px lg:bg-gray-900/10" aria-hidden="true" />

            {/* Profile dropdown */}
            <Menu as="div" className="relative">
              <Menu.Button className="-m-1.5 flex items-center p-1.5">
                <span className="sr-only">Open user menu</span>
                <img
                  className="h-8 w-8 rounded-full bg-gray-50"
                  src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
                  alt=""
                />
                <span className="hidden lg:flex lg:items-center">
                      <span className="ml-4 text-sm font-semibold leading-6 text-gray-900" aria-hidden="true">
                        Tom Cook
                      </span>
                      <ChevronDownIcon className="ml-2 h-5 w-5 text-gray-400" aria-hidden="true" />
                    </span>
              </Menu.Button>
              <Transition
                as={Fragment}
                enter="transition ease-out duration-100"
                enterFrom="transform opacity-0 scale-95"
                enterTo="transform opacity-100 scale-100"
                leave="transition ease-in duration-75"
                leaveFrom="transform opacity-100 scale-100"
                leaveTo="transform opacity-0 scale-95"
              >
                <Menu.Items className="absolute right-0 z-10 mt-2.5 w-32 origin-top-right rounded-md bg-white py-2 shadow-lg ring-1 ring-gray-900/5 focus:outline-none">
                  {userNavigation.map((item) => (
                    <Menu.Item key={item.name}>
                      {({ active }) => (
                        <a
                          href={item.href}
                          className={classNames(
                            active ? 'bg-gray-50' : '',
                            'block px-3 py-1 text-sm leading-6 text-gray-900'
                          )}
                        >
                          {item.name}
                        </a>
                      )}
                    </Menu.Item>
                  ))}
                </Menu.Items>
              </Transition>
            </Menu>
          </div>
        </div>
      </div>

      <main className="py-10">
        <div className="px-4 sm:px-6 lg:px-8">
          {children}
        </div>
      </main>
    </div>
  );
}