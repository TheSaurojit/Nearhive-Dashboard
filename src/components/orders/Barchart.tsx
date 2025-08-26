// "use client"

// import { TrendingUp } from "lucide-react"
// import { Bar, BarChart, CartesianGrid, LabelList, XAxis, YAxis } from "recharts"

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

// export const description = "A bar chart with a custom label"

// const chartData = [
//   { month: "Clock Tower", Orders: 186,  },
//   { month: "Bijoya Bakery", Orders: 305,},
//   { month: "Fusion Frenzy", Orders: 237,},
//   { month: "Sonakshi", Orders: 73,},
//   { month: "Chandan", Orders: 209,},
//    { month: "Chandan", Orders: 109,},
// ]

// const chartConfig = {
//   desktop: {
//     label: "Orders",
//     color: "var(--chart-2)",
//   },
//   label: {
//     color: "var(--background)",
//   },
// } satisfies ChartConfig

// export function ChartBarLabelCustom() {
//   return (
//     <Card>
//       <CardHeader>
//         <CardTitle>Highest Orders</CardTitle>
//         <CardDescription >Stores</CardDescription>
//       </CardHeader>
//       <CardContent>
//         <ChartContainer config={chartConfig}>
//           <BarChart
//             accessibilityLayer
//             data={chartData}
//             layout="vertical"
//             margin={{
//               right: 16,
//             }}
//           >
//             <CartesianGrid horizontal={false} />
//             <YAxis
//               dataKey="month"
//               type="category"
//               tickLine={false}
//               tickMargin={10}
//               axisLine={false}
//               tickFormatter={(value) => value.slice(0, 3)}
//               hide
//             />
//             <XAxis dataKey="Orders" type="number" hide />
//             <ChartTooltip
//               cursor={false}
//               content={<ChartTooltipContent indicator="line" />}
//             />
//             <Bar
//               dataKey="Orders"
             
//               fill="var(--color-desktop)"
//               radius={4}
//             >
//               <LabelList
//                 dataKey="month"
//                 position="insideLeft"
//                 offset={8}
//                 className="fill-(--color-label)"
//                 fontSize={12}
//               />
//               <LabelList
//                 dataKey="Orders"
//                 position="right"
//                 offset={8}
//                 className="fill-foreground"
//                 fontSize={12}
//               />
//             </Bar>
//           </BarChart>
//         </ChartContainer>
//       </CardContent>
//     </Card>
//   )
// }
