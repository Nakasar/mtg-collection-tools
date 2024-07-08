import {Suspense} from "react";
import {getCubes} from "@/app/cubes/actions";
import CubesPage from "@/app/cubes/CubesPage";

export default async function Cubes() {
  const cubes = await getCubes();

  return (
    <Suspense fallback={<div>Loading...</div>}>
      <CubesPage cubes={cubes} />
    </Suspense>
  );
}