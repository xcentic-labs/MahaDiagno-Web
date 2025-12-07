import {
  UsersIcon,
  LayersIcon,
  MapIcon,
  UserCogIcon,
} from "lucide-react"

import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

interface SectionCardsProps {
  title: string;
  label: string;
  data: number | string;
}


export function SectionCards({ data }: { data: SectionCardsProps[] }) {
  return (
    <div className="grid lg:grid-cols-4 md:grid-cols-3 sm:grid-cols-2 grid-cols-1 gap-5">
      {
        data.map((item, index) => (
          <Card className="@container/card">
            <CardHeader className="relative">
              <LayersIcon className="absolute right-4 top-4 h-6 w-6 text-muted-foreground" />
              <CardDescription>{item.label}</CardDescription>
              <CardTitle className="@[250px]/card:text-3xl text-2xl font-semibold tabular-nums tracking-wider">
                {item.data}
              </CardTitle>
            </CardHeader>
          </Card>
        ))
      }
    </div>
  )
}
