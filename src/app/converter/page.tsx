'use client';

import React, {FormEvent, useState} from 'react';
import classNames from "@/helpers/class-name.helper";
import {ArrowRightIcon, ClipboardIcon} from "@heroicons/react/24/outline";
import {MAGIC_SETS} from "@/constants/mtg-sets";
import {DownloadIcon} from "lucide-react";

const cardLineRegex = /(?<quantity>[0-9]{1,2}) (?<name>.+) \((?<set>[A-Z0-9]{3,4})\) (?<code>[0-9]{1,5})(?<foil> \*F\*){0,1}/gm;
const lang = 'French';

export default function Converter() {
  const [converting, setConverting] = useState<boolean>(false);
  const [cardListRaw, setCardListRaw] = useState<string>('');
  const [convertedCards, setConvertedCards] = useState<string>('');
  const [folderName, setFolderName] = useState<string>('');

  async function convertCardList(event?: FormEvent<HTMLFormElement>) {
    event?.preventDefault();

    setConverting(true);
    setConvertedCards('');

    const cards = [...cardListRaw.matchAll(cardLineRegex)];

    const header = 'Folder Name,Quantity,Trade Quantity,Card Name,Set Code,Set Name,Card Number,Condition,Printing,Language,Price Bought,Date Bought';
    const convertedCards = cards.map(card => {
      const sanitizedName = card.groups?.name.includes(',') ? `"${card.groups.name}"` : card.groups?.name;

      if (!MAGIC_SETS[card.groups?.set ?? '']) {
        throw new Error(`Set not found for card: ${card.groups?.name} (${card.groups?.set})`);
      }

      return `${folderName},${card.groups?.quantity},0,${sanitizedName},${card.groups?.set},${MAGIC_SETS[card.groups?.set ?? '']},${card.groups?.code},NearMint,${card.groups?.foil ? 'Foil' : 'Normal'},${lang},0.5,05/09/2024`;
    });

    setConverting(false);
    setConvertedCards(header + '\n' + convertedCards.join('\n'));
  }

  async function downloadConvertedCardsCSV() {
    const blob = new Blob([convertedCards], {type: 'text/csv'});
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'converted-cards.csv';
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex flex-row justify-between">
        <h1 className="text-xl font-semibold pb-8">Convertisseur</h1>
      </div>

      <div className="max-w-6xl">
        <form className="md:flex justify-between" onSubmit={convertCardList}>
          <div className="w-full md:flex-grow">
            <textarea
              id="card-list"
              name="card-list"
              className="w-full block rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-emerald-600 sm:text-sm sm:leading-6"
              rows={20}
              value={cardListRaw}
              onChange={(event) => setCardListRaw(event.target.value)}
              disabled={converting}
            />
          </div>


          <div className="flex flex-col justify-center p-4 space-y-2">
            <input
              type="text"
              className=""
              disabled={converting}
              name="folderName"
              onChange={(event) => setFolderName(event.target.value)}
              value={folderName}
              placeholder="Nom du dossier d'export"
            />
            <button
              type="submit"
              className={classNames(
                converting ? 'bg-emerald-100' : 'bg-emerald-600 hover:bg-emerald-500',
                "inline-flex items-center gap-x-2 rounded-md px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-600"
              )}
              disabled={converting}
            >
              Convertir
              <ArrowRightIcon className="-mr-0.5 h-5 w-5" aria-hidden="true"/>
            </button>
            <button
              type="button"
              className={classNames(
                converting ? 'bg-emerald-100' : 'bg-emerald-600 hover:bg-emerald-500',
                "inline-flex items-center justify-between gap-x-2 rounded-md px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-600"
              )}
              disabled={converting || convertedCards.length === 0}
              onClick={() => (navigator.clipboard.writeText(convertedCards))}
            >
              Copier
              <ClipboardIcon className="-mr-0.5 h-5 w-5" aria-hidden="true"/>
            </button>
            <button
              type="button"
              className={classNames(
                converting ? 'bg-emerald-100' : 'bg-emerald-600 hover:bg-emerald-500',
                "inline-flex items-center justify-between gap-x-2 rounded-md px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-600"
              )}
              disabled={converting || convertedCards.length === 0}
              onClick={downloadConvertedCardsCSV}
            >
              Télécharger
              <DownloadIcon className="-mr-0.5 h-5 w-5" aria-hidden="true"/>
            </button>
          </div>

          <div className="w-full md:flex-grow">
          <textarea
            className="w-full block rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-emerald-600 sm:text-sm sm:leading-6"
            rows={20}
            disabled={converting}
            value={convertedCards}
            readOnly
          />
          </div>
        </form>
      </div>
    </div>
  );
}
