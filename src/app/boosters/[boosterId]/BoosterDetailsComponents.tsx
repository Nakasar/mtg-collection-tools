'use client';

import {TrashIcon} from "@heroicons/react/24/solid";
import {deleteBooster, refreshBoosterPrices} from "@/app/boosters/actions";
import {Euro} from "lucide-react";

export function DeleteBooster({ boosterId }: { boosterId: string }) {
  return (
    <button className="bg-red-700 text-white p-2 rounded-md" onClick={() => deleteBooster(boosterId) }>
      <TrashIcon className="size-6 inline"/> Supprimer
    </button>
  );
}

export function RefreshPrices({ boosterId }: { boosterId: string }) {
  return (
    <button className="bg-yellow-600 text-white p-2 rounded-md" onClick={() => refreshBoosterPrices(boosterId) }>
      <Euro className="size-6 inline"/> Actualiser
    </button>
  );
}
