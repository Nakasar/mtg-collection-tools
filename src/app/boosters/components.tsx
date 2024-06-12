'use client';

import NewBoosterModal from "@/app/boosters/NewBoosterModal";
import Link from "next/link";
import {Booster} from "@/app/boosters/actions";
import {useReducer, useState} from "react";
import {DownloadIcon} from "lucide-react";
import {SelectIcon} from "@radix-ui/react-select";
import {Menu, Transition, MenuItems, MenuItem, MenuButton} from "@headlessui/react";
import {ChevronDownIcon} from "@heroicons/react/20/solid";
import classNames from "@/helpers/class-name.helper";
import BigNumber from "bignumber.js";

function boosterHasAllCards(cardsCount: number, boosterType: Booster['type']) {
  if (boosterType === 'PLAY_BOOSTER') {
    return cardsCount === 14;
  }

  if (boosterType === 'DRAFT_BOOSTER') {
    return cardsCount === 14;
  }

  if (boosterType === 'JUMPSTART') {
    return cardsCount === 20;
  }

  return false;
}

function BoosterCard(booster: Booster) {
  return (
    <div className="bg-white shadow-lg rounded-lg p-4">
      <div className="flex justify-between">
        <div className="text-lg font-semibold">{booster.setCode}</div>
        <div className="text-sm text-gray-500">{booster.type}</div>
      </div>
      <div className="">
        <span
          className={boosterHasAllCards(booster.cards.length, booster.type) ? '' : 'text-red-500'}>{booster.cards.length} carte{booster.cards.length > 1 ? 's' : ''}</span> {booster.price ? `(environ ${booster.price} €)` : ''}
      </div>
    </div>
  );
}

export function BoostersPage({boosters}: { boosters: Booster[] }) {
  const [isSelectMode, setIsSelectMode] = useState(false);
  const [allBoostersSelected, setAllBoostersSelected] = useState(false);
  const [selectedBoosters, dispatchSelectedBoosters] = useReducer((state: { [boosterId: string]: boolean }, action: {
    type: 'SELECT' | 'UNSELECT',
    boosterId: Booster['id']
  }) => {
    if (action.type === 'SELECT') {
      return {
        ...state,
        [action.boosterId]: true
      }
    }

    if (action.type === 'UNSELECT') {
      const newState = {...state};
      delete newState[action.boosterId];
      return newState;
    }

    return state;
  }, {})

  async function exportBoosters({format}: { format: string }) {
    const selectedBoostersData: {
      allBoosters?: boolean;
      boosters?: string[];
      format: string;
    } = {
      format,
    };
    if (allBoostersSelected) {
      selectedBoostersData.allBoosters = true;
    } else {
      const selectedBoostersIds = Object.keys(selectedBoosters);

      if (selectedBoostersIds.length === 0) {
        return;
      }

      selectedBoostersData.boosters = selectedBoostersIds;
    }

    const response = await fetch('/api/boosters/exports', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(selectedBoostersData)
    });

    if (!response.ok) {
      const error = await response.json();
      console.error(error);
      return;
    }

    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = response.headers.get('filename') ?? 'export.json';
    a.click();
    window.URL.revokeObjectURL(url);
  }

  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex flex-row justify-between">
        <h1 className="text-xl font-semibold pb-8">Boosters</h1>

        <div className="space-x-2 flex flex-row items-center">
          {isSelectMode ? (
            <>
              <div className="inline-flex rounded-md shadow-sm">
                <button
                  className="relative inline-flex items-center rounded-l-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-10"
                  onClick={() => exportBoosters({format: 'JSON'})}
                >
                  <DownloadIcon className="w-5 h-5 inline"/> Télécharger
                </button>
                <Menu as="div" className="relative -ml-px block">
                  <MenuButton
                    className="relative inline-flex items-center rounded-r-md bg-white px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-10">
                    <span className="sr-only">Options de format</span>
                    <ChevronDownIcon className="h-5 w-5" aria-hidden="true"/>
                  </MenuButton>
                  <Transition
                    enter="transition ease-out duration-100"
                    enterFrom="transform opacity-0 scale-95"
                    enterTo="transform opacity-100 scale-100"
                    leave="transition ease-in duration-75"
                    leaveFrom="transform opacity-100 scale-100"
                    leaveTo="transform opacity-0 scale-95"
                  >
                    <MenuItems
                      className="absolute right-0 z-10 -mr-1 mt-2 w-56 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                      <div className="py-1">
                        <MenuItem>
                          {({focus}) => (
                            <button
                              className={classNames(
                                focus ? 'bg-gray-100 text-gray-900' : 'text-gray-700',
                                'block px-4 py-2 text-sm'
                              )}
                              onClick={() => exportBoosters({format: 'JSON'})}
                            >
                              Export JSON
                            </button>
                          )}
                        </MenuItem>
                        <MenuItem>
                          {({focus}) => (
                            <button
                              className={classNames(
                                focus ? 'bg-gray-100 text-gray-900' : 'text-gray-700',
                                'block px-4 py-2 text-sm'
                              )}
                              onClick={() => exportBoosters({format: 'DRAGONSHIELD'})}
                            >
                              Export pour DragonShield
                            </button>
                          )}
                        </MenuItem>
                        <MenuItem>
                          {({focus}) => (
                            <button
                              className={classNames(
                                focus ? 'bg-gray-100 text-gray-900' : 'text-gray-700',
                                'block px-4 py-2 text-sm'
                              )}
                              onClick={() => exportBoosters({format: 'MOXFIELD'})}
                            >
                              Export pour Moxfield
                            </button>
                          )}
                        </MenuItem>
                      </div>
                    </MenuItems>
                  </Transition>
                </Menu>
              </div>


              <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                      onClick={() => setAllBoostersSelected(!allBoostersSelected)}>
                Tout sélectionner
              </button>

              <button className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
                      onClick={() => setIsSelectMode(false)}>
                Annuler
              </button>
            </>
          ) : (
            <>
              <NewBoosterModal/>

              <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                      onClick={() => setIsSelectMode(true)}>
                <SelectIcon className="w-5 h-5 inline"/> Sélectionner
              </button>
            </>
          )}
        </div>
      </div>


      <div className="max-w-6xl mx-auto">
        <p>
          Moyenne par
          booster: {boosters.reduce((acc, booster) => acc.plus(booster.price ?? 0), BigNumber(0)).div(boosters.length).toFixed(2)}€
        </p>

        <p>
          Total: {boosters.reduce((acc, booster) => acc.plus(booster.price ?? 0), BigNumber(0)).toFixed(2)}€
        </p>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {boosters.map((booster) => (
            <>
              {isSelectMode ? (
                <button onClick={() => dispatchSelectedBoosters({
                  type: selectedBoosters[booster.id] ? 'UNSELECT' : 'SELECT',
                  boosterId: booster.id
                })}
                        className={(allBoostersSelected || selectedBoosters[booster.id]) ? 'border-green-700 border-4' : ''}>
                  <BoosterCard key={booster.id} {...booster} />
                </button>
              ) : (
                <Link href={`/boosters/${booster.id}`}>
                  <BoosterCard key={booster.id} {...booster} />
                </Link>
              )}
            </>
          ))}
        </div>
      </div>
    </div>
  )
}