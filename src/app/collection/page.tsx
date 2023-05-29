import ImportCollectionForm from "./ImportCollectionForm";
import ExportCollection from "./ExportCollection";

export default function Collection() {
  return (
    <div className="max-w-7xl mx-auto">
      <h1 className="text-xl font-semibold pb-8">Collection</h1>

      <div className="max-w-6xl mx-auto">
        <ImportCollectionForm />

        <ExportCollection />
      </div>
    </div>
  )
}
