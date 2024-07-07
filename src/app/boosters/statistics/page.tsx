import {Suspense} from "react";
import {getBoosters} from "@/app/boosters/actions";
import BigNumber from "bignumber.js";
import {MAGIC_SETS, MAGIC_SETS_DETAILS} from "@/constants/mtg-sets";

type SetStats = {
  boosterCount: number;
  totalValue: BigNumber;
  boosterTypes: { [type: string]: { count: number, totalValue: BigNumber } };
}

export default async function BoostersStatistics() {
  const boosters = await getBoosters();

  const statisticsPerSet: { [setCode: string]: SetStats } = boosters.reduce((acc: { [setCode: string]: SetStats }, booster) => {
    const setCode = booster.setCode;

    if (!acc[setCode]) {
      acc[setCode] = {
        boosterCount: 1,
        totalValue: new BigNumber(booster.price ?? 0),
        boosterTypes: {
          [booster.type]: {
            count: 1,
            totalValue: new BigNumber(booster.price ?? 0),
          },
        },
      };
    } else {
      acc[setCode].boosterCount++;
      acc[setCode].totalValue = acc[setCode].totalValue.plus(booster.price ?? 0);

      if (!acc[setCode].boosterTypes[booster.type]) {
        acc[setCode].boosterTypes[booster.type] = {
          count: 1,
          totalValue: new BigNumber(booster.price ?? 0),
        };
      } else {
        acc[setCode].boosterTypes[booster.type].count++;
        acc[setCode].boosterTypes[booster.type].totalValue = acc[setCode].boosterTypes[booster.type].totalValue.plus(booster.price ?? 0);
      }
    }

    return acc;
  }, {});

  console.log(statisticsPerSet);

  return (
    <Suspense fallback={<div>Loading...</div>}>
      <h1
        className="text-2xl font-bold"
      >
        Statistiques des boosters
      </h1>

      <div className="container mt-4">
        <h2 className="text-xl font-bold">Généralités</h2>
        <p>Nombre de boosters : {boosters.length}</p>
      </div>

      <div className="container mt-4">
        <h2 className="text-xl font-bold">Par extension</h2>

        <ul className="space-y-2">
          {Object.entries(statisticsPerSet).map(([setCode, stats]) => (
            <li key={setCode} className="border-2 border-gray-400 p-2 rounded-md">
              <h3 className="text-lg font-bold">{MAGIC_SETS_DETAILS[setCode].icon_svg_uri && <img src={MAGIC_SETS_DETAILS[setCode].icon_svg_uri} className="size-5 inline-block" />} {MAGIC_SETS_DETAILS[setCode]?.name ?? ''} ({setCode})</h3>
              <p>Nombre de boosters : {stats.boosterCount}</p>
              <p>Valeur totale : {stats.totalValue.toString()} €</p>

              <table className="min-w-full divide-y divide-gray-300">
                <thead>
                  <tr>
                    <th className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-0">Type</th>
                    <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Nombre</th>
                    <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Valeur totale</th>
                    <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Moyenne par booster</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {Object.entries(stats.boosterTypes).map(([type, typeStats]) => (
                    <tr key={type}>
                      <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-0">{type}</td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{typeStats.count}</td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{typeStats.totalValue.toString()} €</td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{typeStats.totalValue.div(typeStats.count).toFixed(2).toString()} €</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </li>
          ))}
        </ul>
      </div>

    </Suspense>
  );
}