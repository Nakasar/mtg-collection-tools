'use client';

import NewBoosterModal from "@/app/boosters/NewBoosterModal";
import Link from "next/link";
import {Booster} from "@/app/boosters/actions";
import {useReducer, useState} from "react";
import {DownloadIcon} from "lucide-react";
import {SelectIcon} from "@radix-ui/react-select";

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
        <span className={boosterHasAllCards(booster.cards.length, booster.type) ? '' : 'text-red-500'}>{booster.cards.length} carte{booster.cards.length > 1 ? 's' : ''}</span> {booster.price ? `(environ ${booster.price} €)` : ''}
      </div>
    </div>
  );
}

export function BoostersPage({ boosters }: { boosters: Booster[] }) {
  const [isSelectMode, setIsSelectMode] = useState(false);
  const [allBoostersSelected, setAllBoostersSelected] = useState(false);
  const [selectedBoosters, dispatchSelectedBoosters] = useReducer((state: { [boosterId: string]: boolean}, action: { type: 'SELECT' | 'UNSELECT', boosterId: Booster['id'] }) => {
    if (action.type === 'SELECT') {
      return {
        ...state,
        [action.boosterId]: true
      }
    }

    if (action.type === 'UNSELECT') {
      const newState = { ...state };
      delete newState[action.boosterId];
      return newState;
    }

    return state;
  }, {})

  async function exportBoosters() {
    const selectedBoostersData: {
      allBoosters?: boolean;
      boosters?: string[];
    } = {};
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

    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'boosters.json';
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
              <button className="bg-green-600 hover:bg-green-800 text-white font-bold py-2 px-4 rounded" onClick={exportBoosters}>
                <DownloadIcon className="w-5 h-5 inline"/> Télécharger
              </button>

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

              <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded" onClick={() => setIsSelectMode(true)} >
                <SelectIcon className="w-5 h-5 inline" /> Sélectionner
              </button>
           </>
          )}
        </div>
      </div>


      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {boosters.map((booster) => (
            <>
              {isSelectMode ? (
                <button onClick={() => dispatchSelectedBoosters({ type: selectedBoosters[booster.id] ? 'UNSELECT' : 'SELECT', boosterId: booster.id })} className={(allBoostersSelected || selectedBoosters[booster.id]) ? 'border-green-700 border-4' : ''}>
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