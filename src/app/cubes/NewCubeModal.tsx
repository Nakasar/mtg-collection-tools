'use client';

import {PlusIcon} from "@heroicons/react/24/solid";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {Input} from "@/components/ui/input";
import {Label} from "@/components/ui/label";
import {createCube} from "@/app/cubes/actions";
import {ArrowDownTrayIcon} from "@heroicons/react/24/outline";

export default function NewCubeModal() {
  return (
    <div>
      <Dialog>
        <DialogTrigger>
          <div className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
            <PlusIcon className="w-5 h-5 inline"/> Créer un Cube
          </div>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Créer un Cube</DialogTitle>
            <DialogDescription>
              <form className="mt-4 space-y-4" action={createCube}>
                <div className="grid w-full max-w-sm items-center gap-1.5">
                  <Label htmlFor="name">Nom du Cube</Label>
                  <Input name="name" type="text" placeholder="Super Cube"/>
                </div>

                <div className="col-span-full">
                  <div
                    className="mt-2 flex justify-center rounded-lg border border-dashed border-gray-900/25 px-6 py-10">
                    <div className="text-center">
                      <ArrowDownTrayIcon className="mx-auto h-12 w-12 text-gray-300" aria-hidden="true"/>
                      <div className="mt-4 flex text-sm leading-6 text-gray-600">
                        <label
                          htmlFor="cube-file"
                          className="relative cursor-pointer rounded-md bg-white font-semibold text-indigo-600 focus-within:outline-none focus-within:ring-2 focus-within:ring-indigo-600 focus-within:ring-offset-2 hover:text-indigo-500"
                        >
                          <span>Importer un cube (optionel)</span>
                          <input id="cube-file" name="cube-file" type="file" className="sr-only"/>
                        </label>
                      </div>
                      <p className="text-xs leading-5 text-gray-600">CSV, format CubeCobra</p>
                    </div>
                  </div>
                </div>

                <input type="submit" value="Créer"
                       className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"/>
              </form>
            </DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    </div>
  );
}
