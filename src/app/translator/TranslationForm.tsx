"use client";

import { ArrowRightIcon, ClipboardIcon } from "@heroicons/react/24/outline";
import {FormEvent, useState} from "react";
import {MeiliSearch} from "meilisearch";
import classNames from "@/helpers/class-name.helper";

const translationLang = ['fr', 'en'];

const client = new MeiliSearch({
  host: 'http://127.0.0.1:7700',
});
const index = client.index<Card>('cards');

type Card = {
  id: string;
  name: string;
  printed_name: string;
}

export default function TranslationForm() {
  const [translating, setTranslating] = useState<boolean>(false);
  const [cardListRaw, setCardListRaw] = useState<string>('');
  const [translateFromLang, setTranslateFromLang] = useState<string>('en');
  const [translateToLang, setTranslateToLang] = useState<string>('fr');
  const [translatedCards, setTranslatedCards] = useState<(Card | null)[]>([]);

  async function translateCardList(event?: FormEvent<HTMLFormElement>) {
    event?.preventDefault();

    setTranslating(true);
    setTranslatedCards([]);

    const cardList = cardListRaw.split('\n');

    if (cardList.length === 0) {
      setTranslating(false);
      return;
    }

    const translatedCardsResult = await Promise.all(cardList.map(async (cardName) => {
      const results = await index.search(cardName, { limit: 1, filter: `lang = ${translateFromLang}` });

      const card = results.hits[0];

      if (!card) {
        return null;
      }

      if (translateToLang === 'en') {
        return card;
      }

      return null;
    }));

    setTranslatedCards(translatedCardsResult);
    setTranslating(false);
  }

  return (
    <form className="md:flex justify-between" onSubmit={translateCardList}>
      <div className="w-full md:flex-grow">
        <select
          id="translate-from-lang"
          name="translate-from-lang"
          className="mt-2 mb-2 block w-full rounded-md border-0 py-1.5 pl-3 pr-10 text-gray-900 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-indigo-600 sm:text-sm sm:leading-6"
          value={translateFromLang}
          onChange={(event) => setTranslateFromLang(event.target.value)}
          disabled={translating}
        >
          {translationLang.map(lang => (<option key={lang}>{lang}</option>))}
        </select>
        <textarea
          id="card-list"
          name="card-list"
          className="w-full block rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-emerald-600 sm:text-sm sm:leading-6"
          rows={20}
          value={cardListRaw}
          onChange={(event) => setCardListRaw(event.target.value)}
          disabled={translating}
        />
      </div>

      <div className="flex flex-col justify-center p-4 space-y-2">
        <button
          type="submit"
          className={classNames(
            translating ? 'bg-emerald-100' : 'bg-emerald-600 hover:bg-emerald-500',
            "inline-flex items-center gap-x-2 rounded-md px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-600"
          )}
          disabled={translating}
        >
          Traduire
          <ArrowRightIcon className="-mr-0.5 h-5 w-5" aria-hidden="true" />
        </button>
        <button
          type="button"
          className={classNames(
            translating ? 'bg-emerald-100' : 'bg-emerald-600 hover:bg-emerald-500',
            "inline-flex items-center justify-between gap-x-2 rounded-md px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-600"
          )}
          disabled={translating || translatedCards.length === 0}
          onClick={() => (navigator.clipboard.writeText(translatedCards.map(card => card ? card.name : '').join('\n')))}
        >
          Copier
          <ClipboardIcon className="-mr-0.5 h-5 w-5" aria-hidden="true" />
        </button>
      </div>

      <div className="w-full md:flex-grow">
        <select
          id="translate-from-lang"
          name="translate-from-lang"
          className="mt-2 mb-2 block w-full rounded-md border-0 py-1.5 pl-3 pr-10 text-gray-900 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-indigo-600 sm:text-sm sm:leading-6"
          value={translateToLang}
          onChange={(event) => setTranslateToLang(event.target.value)}
          disabled={translating}
        >
          {translationLang.map(lang => (<option key={lang}>{lang}</option>))}
        </select>
        <textarea
          className="w-full block rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-emerald-600 sm:text-sm sm:leading-6"
          rows={20}
          disabled={translating}
          value={translatedCards.map(card => card ? card.name : '').join('\n')}
        />
      </div>
    </form>
  );
}