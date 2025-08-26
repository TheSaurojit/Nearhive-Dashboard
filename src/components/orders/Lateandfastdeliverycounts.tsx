// "use client"

// import { TrendingUp } from "lucide-react"
// import { PolarAngleAxis, PolarGrid, Radar, RadarChart } from "recharts"

// import {
//   Card,
//   CardContent,
//   CardDescription,
//   CardFooter,
//   CardHeader,
//   CardTitle,
// } from "@/components/ui/card"
// import {
//   ChartConfig,
//   ChartContainer,
//   ChartTooltip,
//   ChartTooltipContent,
// } from "@/components/ui/chart"

// export const description = "A radar chart with dots"

// const chartData = [
//   { month: "Slow", desktop: 186 },
//   { month: "Mid", desktop: 305 },
//   { month: "Fast", desktop: 237 },
// ]

// const chartConfig = {
//   desktop: {
//     label: "Desktop",
//     color: "var(--chart-1)",
//   },
// } satisfies ChartConfig

// export function ChartRadarDots() {
//   return (
//     <Card>
//       <CardHeader className="items-center">
//         <CardTitle>Delivery Latency</CardTitle>
//         <CardDescription>
//           Showing total deliveries for the last 6 months
//         </CardDescription>
//       </CardHeader>
//       <CardContent className="pb-0">
//         <ChartContainer
//           config={chartConfig}
//           className="mx-auto aspect-square max-h-[250px]"
//         >
//           <RadarChart data={chartData}>
//             <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
//             <PolarAngleAxis dataKey="month" />
//             <PolarGrid />
//             <Radar
//               dataKey="desktop"
//               fill="var(--color-desktop)"
//               fillOpacity={0.6}
//               dot={{
//                 r: 4,
//                 fillOpacity: 1,
//               }}
//             />
//           </RadarChart>
//         </ChartContainer>
//       </CardContent>
//     </Card>
//   )
// }
