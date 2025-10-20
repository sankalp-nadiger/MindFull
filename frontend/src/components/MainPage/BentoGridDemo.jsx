import React from "react";
import { BentoGrid, BentoGridItem } from "./BentoGrid";
import {
  IconArrowWaveRightUp,
  IconBoxAlignRightFilled,
  IconBoxAlignTopLeft,
  IconClipboardCopy,
  IconFileBroken,
  IconSignature,
  IconTableColumn,
} from "@tabler/icons-react";

export function BentoGridDemo() {
  return (
    (<BentoGrid className="max-w-6xl px-2 mx-auto">
      {items.map((item, i) => (
        <BentoGridItem
          key={i}
          title={item.title}
          description={item.description}
          header={item.header}
          icon={item.icon}
          btntext={item.btn}
          bgcolor={item.bgcolor}
          btnSubmit={item.btnSubmit}
          className={i === 3 || i === 6 ? "md:col-span-2" : ""} />
      ))}
    </BentoGrid>)
  );
}
const Skeleton = () => (
  <div
    className="flex flex-1 w-full h-full min-h-[6rem] rounded-xl bg-gradient-to-br from-neutral-200 dark:from-neutral-900 dark:to-neutral-800 to-neutral-100"></div>
);
const items = [
  {
    title: "Mind Quiz: Beginner",
    description: "Tingle you brain cells and unleash your Potential",
    header: <img style={{height:"100%",width:"100%",overflow:"hidden",borderRadius:"10px"}} src="game1.jpg"/>,
    btn: "Play",
    btnSubmit:"Quiz",
    bgcolor:"linear-gradient(to right, #010332, #100328, #29011C,#43000D,#530005)",
  },
  {
    title: "SudokuGame",
    description: "Having a bad day ? Try a Su Do Ku Game",
    header: <img style={{height:"100%",width:"100%",overflow:"hidden",borderRadius:"10px"}} src="sudoku.jpg"/>,
    btn: "Play",
    btnSubmit:"SudokuGame",
    bgcolor:"linear-gradient(to right, #010332, #100328, #29011C,#43000D,#530005)",
  },
  {
    title: "Word Puzzle",
    description: "Discover the beauty of thoughtful and functional design.",
    header: <img style={{height:"100%",width:"100%",overflow:"hidden",borderRadius:"10px"}} src="game3.jpg"/>,
    btn: "Play",
    btnSubmit:"Crossword",
    bgcolor:"linear-gradient(to right, #010332, #100328, #29011C,#43000D,#530005)",
  },
  
];
