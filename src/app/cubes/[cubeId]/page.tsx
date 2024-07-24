import {getCube} from "@/app/cubes/actions";
import Link from "next/link";
import {ChevronLeftIcon} from "@heroicons/react/24/solid";
import React from "react";
import {DeleteBoosterFromCube, DeleteCube, RefreshCollectionState} from "@/app/cubes/[cubeId]/components";
import {CheckCircle, CircleIcon} from "lucide-react";

const cardColorBgByColorIdentity: { [identity: string]: string } = {
  '': 'bg-gray-200',
  'W': 'bg-yellow-200',
  'U': 'bg-blue-200',
  'B': 'bg-slate-600 text-white',
  'R': 'bg-red-200',
  'G': 'bg-green-200',

  'BW': 'bg-gradient-to-r from-slate-600 to-yellow-200 text-white',
  'GW': 'bg-gradient-to-r from-lime-200 to-yellow-200',
  'RU': 'bg-gradient-to-r from-red-200 to-blue-200',
  'UW': 'bg-gradient-to-r from-blue-200 to-yellow-200',
  'BR': 'bg-gradient-to-r from-slate-600 to-red-200',
  'RW': 'bg-gradient-to-r from-red-200 to-yellow-200',
  'WU': 'bg-gradient-to-r from-blue-200 to-yellow-200',
  'BU': 'bg-gradient-to-r from-blue-200 to-slate-600',
  'GU': 'bg-gradient-to-r from-green-200 to-blue-200',
  'GR': 'bg-gradient-to-r from-green-200 to-red-200',
  'BG': 'bg-gradient-to-r from-green-200 to-slate-600',

  'BRW': 'bg-gradient-to-r from-slate-600 via-red-200 to-yellow-200',
  'GRU': 'bg-gradient-to-r from-green-200 via-blue-200 to-red-200',
  'WUB': 'bg-gradient-to-r from-blue-200 via-slate-600 to-yellow-200',
  'RGW': 'bg-gradient-to-r from-green-200 via-red-200 to-yellow-200',
  'BGU': 'bg-gradient-to-r from-green-200 via-blue-200 to-slate-600',
  'RWU': 'bg-gradient-to-r from-blue-200 via-red-200 to-yellow-200',
  'BRU': 'bg-gradient-to-r from-blue-200 via-slate-600 to-red-200',
  'GWU': 'bg-gradient-to-r from-blue-200 via-green-200 to-yellow-200',

  'BRGWU': '',
}

export default async function CubeDetails({ params, searchParams }: { params: { cubeId: string }, searchParams?: { owned: string | string[] | undefined } }) {
  const cube = await getCube(params.cubeId);

  if (!cube) {
    return (<div>Cube not found</div>);
  }

  let boosters = cube.boosters;
  if (searchParams?.owned === 'true') {
    boosters = boosters.filter(booster => booster.cards.every(card => card.owned));
  }

  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex flex-row">
        <Link href="/cubes">
          <ChevronLeftIcon className="size-6"/>
        </Link>

        <h1
          className="text-xl font-semibold pb-8">{cube.name}</h1>
      </div>

      <div className="flex flex-row justify-between">

        <h2 className="text-lg font-semibold">Cartes</h2>

        <div className="space-x-4">
          {searchParams?.owned === 'true' ? (
            <Link href={`/cubes/${cube.id}?owned=false`} className="bg-emerald-600 text-white p-2 rounded-md">
              Tous les boosters
            </Link>
            ) : (
            <Link href={`/cubes/${cube.id}?owned=true`} className="bg-emerald-600 text-white p-2 rounded-md">
              Booster possédés
            </Link>
          )}
          <RefreshCollectionState cubeId={cube.id}/>
          <DeleteCube cubeId={cube.id}/>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 mt-4">
        {boosters.map((booster) => (
          <div key={booster.id} className="border-2 border-gray-400 shadow-lg rounded-md">
            <div className="bg-emerald-700 p-2 w-full flex justify-between">
              <h2 className="text-lg text-white">{booster.name}</h2>
              <div>
                <DeleteBoosterFromCube cubeId={cube.id} boosterId={booster.id} />
              </div>
            </div>

            <div className="p-4 divide-y">
              {booster.cards.map((card, index) => (
                <div key={index} className="flex flex-row">
                  <div>
                    {!card.owned && <CircleIcon className="size-4 inline-block mr-2 text-gray-500" />}
                    {card.owned && card.ownedEnough && <CheckCircle className="size-4 inline-block mr-2 text-green-500" />}
                    {card.owned && !card.ownedEnough && <CheckCircle className="size-4 inline-block mr-2 text-orange-500" />}
                  </div>
                  <div className={`${cardColorBgByColorIdentity[card.colorIdentity?.join('') ?? '']} flex-grow`}>
                    <span>{card.name}</span>
                    <span className="pl-2">{card.manaCost?.split(/[{}]/).filter(symbol => symbol).map((manaSymbol, index) => <img key={index} className="size-4 inline-block" src={`https://svgs.scryfall.io/card-symbols/${manaSymbol.replaceAll('/', '')}.svg`} />)}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
