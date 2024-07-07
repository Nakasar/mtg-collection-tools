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
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import {createBooster} from "@/app/boosters/actions";

export default function NewBoosterModal() {
  return (
    <div>
      <Dialog>
        <DialogTrigger>
          <div className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
            <PlusIcon className="w-5 h-5 inline"/> Nouveau
          </div>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Ajouter un booster</DialogTitle>
            <DialogDescription>
              <form className="mt-4 space-y-4" action={createBooster}>
                <div className="grid w-full max-w-sm items-center gap-1.5">
                  <Label htmlFor="setCode">Set code</Label>
                  <Input name="setCode" type="text" placeholder="SET" defaultValue="MH3"/>
                </div>

                <div className="grid w-full max-w-sm items-center gap-1.5">
                  <Label htmlFor="boosterType">Type de booster</Label>
                  <Select name="boosterType" defaultValue="PLAY_BOOSTER">
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Type de booster"/>
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        <SelectLabel>Type de booster</SelectLabel>
                        <SelectItem value="PLAY_BOOSTER">Booster de jeu</SelectItem>
                        <SelectItem value="COLLECTOR">Booster Collector</SelectItem>
                        <SelectItem value="JUMPSTART">Jumpstart</SelectItem>
                        <SelectItem value="SET_BOOSTER">Booster d&apos;extension</SelectItem>
                        <SelectItem value="DRAFT_BOOSTER">Booster de draft</SelectItem>
                        <SelectItem value="BEYOND">Booster Infini</SelectItem>
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid w-full max-w-sm items-center gap-1.5">
                  <Label htmlFor="lang">Langue</Label>
                  <Select name="lang" defaultValue="fr">
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Langue"/>
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        <SelectLabel>Type de booster</SelectLabel>
                        <SelectItem value="fr">Français</SelectItem>
                        <SelectItem value="en">Anglais</SelectItem>
                      </SelectGroup>
                    </SelectContent>
                  </Select>
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
