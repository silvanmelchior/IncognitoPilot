import Image from "next/image";
import iconColor from "./icon_color.png";

export default function Brand() {
  return (
    <div className="flex h-full flex-col items-center justify-center">
      <div className="w-48">
        <Image src={iconColor} alt="Brand" priority />
      </div>
      <div className="text-2xl text-blue-200 mt-4">Incognito Pilot</div>
      <div className="text-lg text-blue-200 mt-1">
        Your local AI code interpreter
      </div>
    </div>
  );
}
