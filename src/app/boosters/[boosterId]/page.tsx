import {addCardToBoster, getBooster} from "@/app/boosters/actions";
import AddCardBar from "@/app/boosters/[boosterId]/AddCardBar";
import CardCard from "@/app/boosters/[boosterId]/CardCard";
import {DeleteBooster, RefreshPrices} from "@/app/boosters/[boosterId]/BoosterDetailsComponents";
import {ChevronLeftIcon} from "@heroicons/react/24/solid";
import Link from "next/link";

const langToFlag: { [lang: string]: string } = {
  'fr': '🇫🇷',
  'en': '🇬🇧',
  'de': '🇩🇪',
  'es': '🇪🇸',
  'it': '🇮🇹',
  'pt': '🇵🇹',
  'ja': '🇯🇵',
  'ko': '🇰🇷',
  'ru': '🇷🇺',
}

export default async function BoosterDetails({ params }: { params: { boosterId: string } }) {
  const booster = await getBooster(params.boosterId);

  if (!booster) {
    return <div>Booster not found</div>;
  }

  async function addCard({ setCode, collectorNumber, foil }: { setCode: string; collectorNumber: string; foil: boolean }) {
    'use server';

    if (!booster) {
      throw new Error('Booster not found');
    }

    await addCardToBoster(booster.id, { setCode, collectorNumber, foil });
  }

  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex flex-row">
        <Link href="/boosters">
          <ChevronLeftIcon className="size-6"/>
        </Link>

        <h1 className="text-xl font-semibold pb-8">{langToFlag[booster.lang] ?? booster.lang} {booster.setCode} {booster.type}</h1>
      </div>

      <p className="text-lg font-semibold">Valeur estimée : {booster.price ?? '-'} €</p>

      <div className="max-w-6xl mx-auto">
        <div className="flex flex-row justify-between">

          <h2 className="text-lg font-semibold">Cartes</h2>

          <div className="space-x-4">
            <RefreshPrices boosterId={booster.id}/>
            <DeleteBooster boosterId={booster.id}/>
          </div>
        </div>

        <div className="py-8">
          <AddCardBar
            setCode={booster.setCode}
            lang={booster.lang ?? 'en'}
            addCard={addCard}
          />
        </div>

        <div className="flex flex-wrap gap-2">
          {booster.cards.map((card) => (
            <CardCard card={card} key={card.id} boosterId={booster.id}/>
          ))}
        </div>
      </div>
    </div>
  );
}