'use client';

import * as React from 'react';
import { Ban, TrendingUp } from 'lucide-react';
import { Label, Pie, PieChart } from 'recharts';

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart';
import { categorySchema } from '@/schemas/form';
import { getFirstAndLastDayOfMonth } from '@/lib/helpers';
import { format } from 'date-fns';
import { useSearchParams } from 'next/navigation';

const pieData = categorySchema.options
  .map((category, index) => {
    return {
      [category]: {
        label: category,
        color: `hsl(var(--chart-${index + 1}))`,
      },
    };
  })
  .reduce((acc, obj) => {
    const [key, value] = Object.entries(obj)[0];
    acc[key.toLowerCase().split(' ')[0]] = value;
    return acc;
  }, {});

const chartConfig = {
  totalValue: {
    label: 'outflows',
  },
  ...pieData,
} satisfies ChartConfig;

export function CategoryAnalysis({ chartData, noData }) {
  const totalOutflows = React.useMemo(() => {
    return chartData.reduce((acc, curr) => acc + curr.totalValue, 0);
  }, []);

  const { firstDay, lastDay } = getFirstAndLastDayOfMonth('local');
  const searchParams = useSearchParams();

  return (
    <Card className="flex flex-col relative">
      {noData && (
        <div className="absolute flex items-center rounded-sm justify-center z-10 backdrop-blur-sm top-0 w-full h-full">
          <span className="text-gray-400 flex items-center space-x-2">
            <Ban /> <span>No data available</span>
          </span>
        </div>
      )}
      <CardHeader className="items-center pb-0">
        <CardTitle>Analysis by Category</CardTitle>
        <CardDescription>
          {format(searchParams.get('from') || firstDay, 'LLL dd')} -{' '}
          {format(searchParams.get('to') || lastDay, 'LLL dd y')}
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-1 pb-0">
        <ChartContainer
          config={chartConfig}
          className="mx-auto aspect-square max-h-[250px]"
        >
          <PieChart>
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent hideLabel />}
            />
            <Pie
              data={chartData}
              dataKey="totalValue"
              nameKey="category"
              innerRadius={60}
              strokeWidth={5}
            >
              <Label
                content={({ viewBox }) => {
                  if (viewBox && 'cx' in viewBox && 'cy' in viewBox) {
                    return (
                      <text
                        x={viewBox.cx}
                        y={viewBox.cy}
                        textAnchor="middle"
                        dominantBaseline="middle"
                      >
                        <tspan
                          x={viewBox.cx}
                          y={viewBox.cy}
                          className="fill-foreground text-3xl font-bold"
                        >
                          {Math.floor(totalOutflows).toLocaleString()}
                        </tspan>
                        <tspan
                          x={viewBox.cx}
                          y={(viewBox.cy || 0) + 24}
                          className="fill-muted-foreground"
                        >
                          transactions
                        </tspan>
                      </text>
                    );
                  }
                }}
              />
            </Pie>
          </PieChart>
        </ChartContainer>
      </CardContent>
      <CardFooter className="flex-col gap-2 text-sm">
        <div className="flex items-center gap-2 font-medium leading-none">
          Trending up by 5.2% this month <TrendingUp className="h-4 w-4" />
        </div>
        <div className="leading-none text-muted-foreground">
          Showing total visitors for the last 6 months
        </div>
      </CardFooter>
    </Card>
  );
}
