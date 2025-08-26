// "use client"

// import { Bar, BarChart, XAxis, YAxis } from "recharts"

// import {
//   Card,
//   CardContent,
//   CardDescription,
//   CardHeader,
//   CardTitle,
// } from "@/components/ui/card"
// import {
//   ChartConfig,
//   ChartContainer,
//   ChartTooltip,
//   ChartTooltipContent,
// } from "@/components/ui/chart"

// export const description = "A mixed bar chart with locations"

// const chartData = [
//   { location: "Delhi", orders: 275, fill: "var(--color-delhi)" },
//   { location: "Mumbai", orders: 200, fill: "var(--color-mumbai)" },
//   { location: "Bangalore", orders: 187, fill: "var(--color-bangalore)" },
//   { location: "Kolkata", orders: 173, fill: "var(--color-kolkata)" },
//   { location: "Others", orders: 90, fill: "var(--color-others)" },
// ]

// const chartConfig = {
//   orders: {
//     label: "Orders",
//   },
//   delhi: {
//     label: "Delhi",
//     color: "var(--chart-1)",
//   },
//   mumbai: {
//     label: "Mumbai",
//     color: "var(--chart-2)",
//   },
//   bangalore: {
//     label: "Bangalore",
//     color: "var(--chart-3)",
//   },
//   kolkata: {
//     label: "Kolkata",
//     color: "var(--chart-4)",
//   },
//   others: {
//     label: "Others",
//     color: "var(--chart-5)",
//   },
// } satisfies ChartConfig

// export function ChartBarMixed() {
//   return (
//     <Card>
//       <CardHeader>
//         <CardTitle>Highest Orders</CardTitle>
//         <CardDescription>By Location</CardDescription>
//       </CardHeader>
//       <CardContent>
//         <ChartContainer config={chartConfig}>
//           <BarChart
//             data={chartData}
//             layout="vertical"
//             margin={{
//               left: 0,
//             }}
//           >
//             <YAxis
//               dataKey="location"
//               type="category"
//               tickLine={false}
//               tickMargin={10}
//               axisLine={false}
// tickFormatter={(value) =>
//   chartConfig[value as keyof typeof chartConfig]?.label ?? value
// }


//             />
//             <XAxis dataKey="orders" type="number" hide />
//             <ChartTooltip
//               cursor={false}
//               content={<ChartTooltipContent hideLabel />}
//             />
//             <Bar dataKey="orders" radius={5} />
//           </BarChart>
//         </ChartContainer>
//       </CardContent>
//     </Card>
//   )
// }
