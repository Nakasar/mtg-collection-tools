import TranslationForm from "@/app/translator/TranslationForm";

export default function Translator() {
  return (
    <div className="max-w-7xl mx-auto">
      <h1 className="text-xl font-semibold pb-8">Traducteur</h1>

      <div className="max-w-6xl mx-auto">
        <TranslationForm />
      </div>
    </div>
  );
}