import React, { useEffect, useRef, useState } from "react";
import {
  Chart,
  LineController,
  LineElement,
  PointElement,
  LinearScale,
  CategoryScale,
  Title,
  Tooltip,
  Filler,
  Legend,
  type TooltipItem,
} from "chart.js";
import { TrendingUp, AlertTriangle, CalendarX, Package, Loader2 } from "lucide-react";
import { getDashboardStats } from "../../utils/api";

Chart.register(LineController, LineElement, PointElement, LinearScale, CategoryScale, Title, Tooltip, Filler, Legend);

interface Stats {
  today_sales: number;
  expired_items: number;
  low_stock_items: number;
  total_medicines: number;
  weekly_sales?: number[];
}

type CardColorKey = "blue" | "red" | "orange" | "green";

type StatCard = {
  title: string;
  value: React.ReactNode;
  icon: React.ReactElement;
  color: CardColorKey;
};

const DashboardAnalytics: React.FC = () => {
  const [stats, setStats] = useState<Stats>({
    today_sales: 0,
    expired_items: 0,
    low_stock_items: 0,
    total_medicines: 0,
    weekly_sales: [],
  });
  const [weeklySales, setWeeklySales] = useState<number[]>([0, 0, 0, 0, 0, 0, 0]);
  const [loading, setLoading] = useState(true);

  const chartRef = useRef<HTMLCanvasElement | null>(null);
  const chartInstance = useRef<Chart<"line", number[], string> | null>(null);

  useEffect(() => {
    loadStats();
    return () => {
      chartInstance.current?.destroy();
    };
  }, []);

  useEffect(() => {
    if (weeklySales.length > 0) {
      createChart();
    }
  }, [weeklySales]);

  const loadStats = async () => {
    setLoading(true);
    try {
      const data = await getDashboardStats();
      // Map API DashboardStats to the local Stats shape
      setStats({
        today_sales: Number(data.today_sales) || 0,
        expired_items: (data as any).expired_items || 0,
        low_stock_items: data.low_stock_items || 0,
        total_medicines: (data as any).total_medicines || 0,
        weekly_sales: Array.isArray(data.weekly_sales) ? data.weekly_sales.map(n => Number(n || 0)) : [],
      });
      // ensure we always pass an array of 7 numbers to the chart
      const wk = (Array.isArray(data.weekly_sales) ? data.weekly_sales : []);
      const padded = [...wk].concat(Array(7 - wk.length).fill(0)).slice(0, 7).map(n => Number(n || 0));
      setWeeklySales(padded);
    } catch (error) {
      console.error("Load stats error:", error);
    } finally {
      setLoading(false);
    }
  };

  const createChart = () => {
    if (chartInstance.current) chartInstance.current.destroy();
    const ctx = chartRef.current?.getContext("2d");
    if (!ctx) return;

    chartInstance.current = new Chart<"line", number[], string>(ctx, {
      type: "line",
      data: {
        labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
        datasets: [{
          label: "Sales",
          data: weeklySales,
          borderColor: "#10b981",
          backgroundColor: "rgba(16, 185, 129, 0.1)",
          tension: 0.4,
          fill: true,
        }],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: {
              label: (context: TooltipItem<"line">) => {
                const parsed = (context.parsed as any);
                const y = typeof parsed === "number" ? parsed : (parsed && typeof parsed.y === "number" ? parsed.y : 0);
                return `Sales: $${y.toFixed(2)}`;
              },
            },
          },
        },
        scales: {
          y: {
            beginAtZero: true,
            ticks: {
              callback: (value: number | string) => `$${value}`,
            },
          },
        },
      },
    });
  };

  const colorClasses: Record<CardColorKey, { border: string; bg: string; text: string }> = {
    blue: { border: "border-blue-500", bg: "bg-blue-100", text: "text-blue-600" },
    red: { border: "border-red-500", bg: "bg-red-100", text: "text-red-600" },
    orange: { border: "border-orange-500", bg: "bg-orange-100", text: "text-orange-600" },
    green: { border: "border-green-500", bg: "bg-green-100", text: "text-green-600" },
  };

  const cards: StatCard[] = [
    { title: "Today's Sales", value: `$${stats.today_sales.toFixed(2)}`, icon: <TrendingUp />, color: "blue" },
    { title: "Low Stock Items", value: stats.low_stock_items, icon: <AlertTriangle />, color: "red" },
    { title: "Expired Items", value: stats.expired_items, icon: <CalendarX />, color: "orange" },
    { title: "Total Medicines", value: stats.total_medicines, icon: <Package />, color: "green" },
  ];

  return (
    <div className="p-6 space-y-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Dashboard Overview</h1>

      {loading ? (
        <div className="flex justify-center items-center p-20">
          <Loader2 className="animate-spin text-green-600" size={48} />
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Stat Cards */}
          <div className="lg:col-span-1 grid grid-cols-1 sm:grid-cols-2 gap-6">
            {cards.map((card, idx) => {
              const colors = colorClasses[card.color];
              return (
                <div
                  key={idx}
                  className={`bg-white rounded-2xl shadow-md p-5 flex flex-col justify-between hover:shadow-lg transition-all duration-300 border-l-4 ${colors.border}`}
                >
                  <div className="flex items-center justify-between">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${colors.bg} ${colors.text}`}>
                      {React.cloneElement(card.icon as React.ReactElement, { size: 24 } as any)}
                    </div>
                    <span className="text-3xl font-bold text-gray-800">{card.value}</span>
                  </div>
                  <p className="text-gray-600 text-sm mt-4">{card.title}</p>
                </div>
              );
            })}
          </div>

          {/* Sales Chart */}
          <div className="lg:col-span-2 bg-white rounded-2xl shadow-md p-6 flex flex-col">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Weekly Sales</h2>
            <div className="flex-1 min-h-[160px] md:min-h-[300px]">
              <canvas ref={chartRef} className="w-full h-56 md:h-72" />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DashboardAnalytics;
