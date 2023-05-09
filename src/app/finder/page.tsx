import FinderApp from "@/app/finder/FinderApp";

export default function Finder() {
  return (
    <div className="max-w-7xl mx-auto">
      <h1 className="text-xl font-semibold pb-8">Rechercher dans la collection</h1>

      <div className="max-w-6xl mx-auto">
        <FinderApp />
      </div>
    </div>
  );
}