import {getCube} from "@/app/cubes/actions";
import Link from "next/link";
import {ChevronLeftIcon} from "@heroicons/react/24/solid";
import React from "react";
import {DeleteCube, RefreshCollectionState} from "@/app/cubes/[cubeId]/components";
import {CheckCircle, CircleIcon} from "lucide-react";

export default async function CubeDetails({ params }: { params: { cubeId: string } }) {
  const cube = await getCube(params.cubeId);

  if (!cube) {
    return (<div>Cube not found</div>);
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
          <RefreshCollectionState cubeId={cube.id}/>
          <DeleteCube cubeId={cube.id}/>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 mt-4">
        {cube.boosters.map((booster) => (
          <div key={booster.id} className="border-2 border-gray-400 shadow-lg rounded-md">
            <div className="bg-emerald-700 p-2 w-full">
              <h2 className="text-lg text-white">{booster.name}</h2>
            </div>

            <div className="p-4 divide-y">
              {booster.cards.map((card, index) => (
                <div key={index}>
                  <span>
                    {!card.owned && <CircleIcon className="size-4 inline-block mr-2 text-gray-500" />}
                    {card.owned && card.ownedEnough && <CheckCircle className="size-4 inline-block mr-2 text-green-500" />}
                    {card.owned && !card.ownedEnough && <CheckCircle className="size-4 inline-block mr-2 text-orange-500" />}
                    {card.name}
                  </span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
