import {getBoosters} from "@/app/boosters/actions";
import {BoostersPage} from "@/app/boosters/components";
import {Suspense} from "react";

export default async function Boosters() {
  const boosters = await getBoosters();

  return (
    <Suspense fallback={<div>Loading...</div>}>
      <BoostersPage boosters={boosters} />
    </Suspense>
  );
}