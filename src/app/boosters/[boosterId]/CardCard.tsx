'use client';

import {Booster, Card, removeCardFromBooster, updateCardInBooster} from "@/app/boosters/actions";
import { StarIcon as StarIconFull, TrashIcon } from "@heroicons/react/24/solid";
import { StarIcon as StarIconEmpty } from "@heroicons/react/24/outline";

export default function CardCard({ card, boosterId }: { boosterId: Booster['id'], card: Card }) {
  return (
    <div key={card.id} className={`rounded-md border-2 ${card.foil ? 'border-yellow-500' : 'border-gray-200'} p-2 w-[160px] flex flex-col`}>
      {card.newInCollection && <p className="px-2 rounded-full bg-yellow-500 w-fit opacity-80 self-center absolute">Première !</p>}
      <img src={card.imageUrl} alt={card.name} className={``}/>
      <p>{card.name}</p>
      <p>{card.setCode} #{card.collectorNumber}</p>
      <p>{card.price} €</p>
      <div>
        <button onClick={async () => {
          await removeCardFromBooster(boosterId, card.id);
        }}>
          <TrashIcon className="size-5 text-red-700"/>
        </button>

        {card.foil ? (
          <button onClick={async () => {
            await updateCardInBooster(boosterId, card.id, { foil: false });
          }}>
            <StarIconFull className="size-5 text-yellow-500"/>
          </button>
        ) : (
          <button onClick={async () => {
            await updateCardInBooster(boosterId, card.id, {foil: true});
          }}>
            <StarIconEmpty className="size-5 text-yellow-500"/>
          </button>
        )}
      </div>
    </div>
  );
}
