import { SectionCards } from "@/components/section-cards"
import { ChartAreaInteractive } from "@/components/chart-area-interactive"


export default function DashBoard() {
    return (
        <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6 p-5">
            <h1 className=" font-bold text-xl tracking-wider">Statics</h1>
            <SectionCards />
            <h1 className=" font-bold text-xl tracking-wider">Quick Acess</h1>
            <SectionCards />
            
        </div>
    )
}