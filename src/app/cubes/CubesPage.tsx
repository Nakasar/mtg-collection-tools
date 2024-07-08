'use client';

import React from 'react';

import {Cube} from "@/app/cubes/actions";
import NewCubeModal from "@/app/cubes/NewCubeModal";
import Link from "next/link";
import {MagnifyingGlassIcon} from "@heroicons/react/20/solid";

export default function CubesPage({ cubes }: { cubes: Cube[] }) {
  return (
    <div className="w-full mx-auto">
      <div className="flex flex-row justify-between">
        <h1 className="text-xl font-semibold pb-8">Cubes</h1>

        <div className="space-x-2 flex flex-row items-center">
          <div>
            <NewCubeModal />
          </div>
        </div>
      </div>

      <div className="w-full mx-auto">
        <div className="grid grid-cols-3">
          {cubes.map((cube) => (
            <div key={cube.id} className="border-2 border-gray-400 shadow-lg p-2 rounded-md">
              <h2>{cube.name}</h2>

              <Link href={`/cubes/${cube.id}`} className="bg-emerald-500 text-white p-2 inline-block rounded-md">
                <MagnifyingGlassIcon className="size-5 inline-block"/> Consulter
              </Link>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
