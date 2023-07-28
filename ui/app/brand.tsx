import { TbRobot } from "react-icons/tb";

export default function Brand() {
  return (
    <div className="flex h-full flex-col items-center justify-center">
      <TbRobot size={96} color="#bfdbfe"/>
      <div className="text-2xl text-blue-200">Incognito Pilot</div>
      <div className="text-lg text-blue-200 mt-1">Your local AI code interpreter</div>
    </div>
  )
}
