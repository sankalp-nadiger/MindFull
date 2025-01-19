import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";
export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export const BentoGrid = ({
  className,
  children
}) => {
  return (
    (<div
      className={cn(
        "grid md:auto-rows-[18rem] grid-cols-1 md:grid-cols-3 gap-4 max-w-7xl mx-auto bg-black ",
        className
      )}>
      {children}
    </div>)
  );
};

export const BentoGridItem = ({
  className,
  title,
  description,
  header,
  btntext,
  bgcolor,
  btnSubmit
}) => {
  return (
    (<div
      className={cn(
        "row-span-1 rounded-xl group/bento hover:shadow-xl transition duration-200 shadow-input dark:shadow-none p-4 bg-black  dark:border-white/[0.2] border border-transparent justify-between flex flex-col space-y-4",
        className
      )} style={{backgroundImage:bgcolor,boxShadow:"0 8px 16px rgba(0, 0, 0, 0.5)"}}>
      {header}
      <div className="group-hover/bento:translate-x-2 transition duration-200">
        <div
          className="font-sans font-bold text-neutral-600 dark:text-neutral-200 mb-2 mt-2">
          {title}
        </div>
        <div
          className="font-sans font-normal text-neutral-600 text-xs dark:text-neutral-300">
          {description}
        </div>
        <div className="flex justify-start align-middle">
            <button class="relative m-0 my-2 w-30 px-2  text-lg font-bold text-white bg-black border-2 border-pink-500 rounded-lg transition duration-500 hover:shadow-[0_0_20px_5px_rgba(236,72,153,0.8)] group"
            type="submit" name={btnSubmit}>
    <span class="absolute inset-0 bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 blur-lg opacity-75 group-hover:opacity-100 transition duration-500"></span>
    <span class="relative z-10">{btntext}</span>
  </button>
  </div>
      </div>
    </div>)
  );
};
