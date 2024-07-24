'use client';

import {ArrowPathRoundedSquareIcon, TrashIcon} from "@heroicons/react/24/solid";
import {deleteBoosterFromCube, deleteCube, refreshCube} from "@/app/cubes/actions";
import React from "react";

export function DeleteCube({ cubeId }: { cubeId: string }) {
  return (
    <button className="bg-red-700 text-white p-2 rounded-md" onClick={() => deleteCube(cubeId) }>
      <TrashIcon className="size-6 inline-block"/> Supprimer
    </button>
  );
}

export function RefreshCollectionState({ cubeId }: { cubeId: string }) {
  return (
    <button className="bg-yellow-600 text-white p-2 rounded-md" onClick={() => refreshCube(cubeId) }>
      <ArrowPathRoundedSquareIcon className="size-6 inline-block"/> Actualiser
    </button>
  );
}

export function DeleteBoosterFromCube({ cubeId, boosterId }: { cubeId: string, boosterId: string }) {
  return (
    <button onClick={() => deleteBoosterFromCube(cubeId, boosterId)}>
      <TrashIcon className="size-6 text-white"/>
    </button>
  );
}