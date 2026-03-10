import LetterDesign from "@/components/LetterDesign";

export default function Home() {
  return (
    <div className="flex w-screen h-screen items-center justify-center gap-10">
      <LetterDesign letter="F" />
      <LetterDesign letter="O" />
      <LetterDesign letter="C" />
      <LetterDesign letter="H" />
      <LetterDesign letter="A" />
      <LetterDesign letter="N" />
      <LetterDesign letter="T" />
      <LetterDesign letter="." />
    </div>
  );
}
