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

export function SectionCards({totalUsers , totalServices , totalServiceBoy , totalZones} : {totalUsers : string | number , totalServices  : string | number , totalServiceBoy : string | number , totalZones : string | number }) {
  return (
    <div className="grid lg:grid-cols-4 md:grid-cols-3 sm:grid-cols-2 grid-cols-1 gap-5">
      <Card className="@container/card">
        <CardHeader className="relative">
          <UsersIcon className="absolute right-4 top-4 h-6 w-6 text-muted-foreground" />
          <CardDescription>Total Users</CardDescription>
          <CardTitle className="@[250px]/card:text-3xl text-2xl font-semibold tabular-nums tracking-wider">
            {totalUsers}
          </CardTitle>
        </CardHeader>
      </Card>

      <Card className="@container/card">
        <CardHeader className="relative">
          <LayersIcon className="absolute right-4 top-4 h-6 w-6 text-muted-foreground" />
          <CardDescription>Total Services</CardDescription>
          <CardTitle className="@[250px]/card:text-3xl text-2xl font-semibold tabular-nums tracking-wider">
            {totalServices}
          </CardTitle>
        </CardHeader>
      </Card>

      <Card className="@container/card">
        <CardHeader className="relative">
          <MapIcon className="absolute right-4 top-4 h-6 w-6 text-muted-foreground" />
          <CardDescription>Total Zones</CardDescription>
          <CardTitle className="@[250px]/card:text-3xl text-2xl font-semibold tabular-nums tracking-wider">
            {totalZones}
          </CardTitle>
        </CardHeader>
      </Card>

      <Card className="@container/card">
        <CardHeader className="relative">
          <UserCogIcon className="absolute right-4 top-4 h-6 w-6 text-muted-foreground" />
          <CardDescription>Total Services Boy</CardDescription>
          <CardTitle className="@[250px]/card:text-3xl text-2xl font-semibold tabular-nums tracking-wider">
            {totalServiceBoy}
          </CardTitle>
        </CardHeader>
      </Card>
    </div>
  )
}
