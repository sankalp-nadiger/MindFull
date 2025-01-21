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
    (<BentoGrid className="max-w-6xl py-4 px-2 mx-auto">
      {items.map((item, i) => (
        <BentoGridItem
          key={i}
          title={item.title}
          description={item.description}
          header={item.header}
          icon={item.icon}
          btntext={item.btn}
          bgcolor={item.bgcolor}
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
    bgcolor:"linear-gradient(to right, #010332, #100328, #29011C,#43000D,#530005)",
  },
  {
    title: "Game 2",
    description: "Dive into the transformative power of technology.",
    header: <img style={{height:"100%",width:"100%",overflow:"hidden",borderRadius:"10px"}} src="game2.jpg"/>,
    btn: "Play",
    bgcolor:"linear-gradient(to right, #010332, #100328, #29011C,#43000D,#530005)",
  },
  {
    title: "Game 3",
    description: "Discover the beauty of thoughtful and functional design.",
    header: <img style={{height:"100%",width:"100%",overflow:"hidden",borderRadius:"10px"}} src="game3.jpg"/>,
    btn: "Play",
    bgcolor:"linear-gradient(to right, #010332, #100328, #29011C,#43000D,#530005)",
  },
  {
    title: "Activity Recommendation",
    description:
      "Understand the impact of effective communication in our lives.",
    header:<img style={{height:"100%",width:"100%",overflow:"hidden",borderRadius:"10px"}} src="activity.png"/> ,
    btn: "Activities",
    bgcolor:"linear-gradient(to right,#000428,  #004e92)",

  },
  {
    title: "The Pursuit of Knowledge",
    description: "Join the quest for understanding and enlightenment.",
    header: <Skeleton />,
    btn: "Play",
    bgcolor:"linear-gradient(to right, #010332, #100328, #29011C,#43000D,#530005)",
  },
  {
    title: "The Joy of Creation",
    description: "Experience the thrill of bringing ideas to life.",
    header: <Skeleton />,
    btn: "Play",
    bgcolor:"linear-gradient(to right, #010332, #100328, #29011C,#43000D,#530005)",
  },
  {
    title: "The Spirit of Adventure",
    description: "Embark on exciting journeys and thrilling discoveries.",
    header: <Skeleton />,
    btn: "Play",
    bgcolor:"linear-gradient(to right, #010332, #100328, #29011C,#43000D,#530005)",
  },
];
