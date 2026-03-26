import Layout from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MapPin, Camera, Users, Clapperboard, DollarSign, Calendar, TrendingUp, Plus } from "lucide-react";

const stats = [
  { label: "Total Bookings", value: "47", icon: Calendar, change: "+12%" },
  { label: "Revenue", value: "$12,450", icon: DollarSign, change: "+8%" },
  { label: "Active Listings", value: "12", icon: TrendingUp, change: "+3" },
  { label: "Pending Reviews", value: "5", icon: Users, change: "New" },
];

const recentBookings = [
  { id: 1, service: "Desert Oasis Villa", type: "Location", client: "Sarah K.", date: "Mar 25, 2026", status: "Confirmed", amount: "$500" },
  { id: 2, service: "ARRI ALEXA Mini LF", type: "Equipment", client: "Film Studio X", date: "Mar 24, 2026", status: "Pending", amount: "$800" },
  { id: 3, service: "Omar Hassan", type: "Model", client: "Ad Agency Co.", date: "Mar 23, 2026", status: "Completed", amount: "$350" },
  { id: 4, service: "Ahmed Salim (DP)", type: "Crew", client: "Indie Films", date: "Mar 22, 2026", status: "Confirmed", amount: "$600" },
];

const statusColor = (s: string) => {
  switch (s) {
    case "Confirmed": return "bg-green-600";
    case "Pending": return "bg-amber-600";
    case "Completed": return "bg-blue-600";
    default: return "bg-muted";
  }
};

const Dashboard = () => (
  <Layout>
    <div className="container py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-display text-4xl text-foreground">Dashboard</h1>
          <p className="text-muted-foreground">Overview of your production marketplace activity.</p>
        </div>
        <Button className="bg-gradient-gold text-primary-foreground font-semibold">
          <Plus className="h-4 w-4 mr-2" /> Add Listing
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-8">
        {stats.map((s) => (
          <Card key={s.label} className="border-border/50">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">{s.label}</p>
                <s.icon className="h-4 w-4 text-primary" />
              </div>
              <p className="mt-2 text-2xl font-bold text-foreground">{s.value}</p>
              <p className="mt-1 text-xs text-primary">{s.change}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Tabs defaultValue="bookings">
        <TabsList>
          <TabsTrigger value="bookings">Recent Bookings</TabsTrigger>
          <TabsTrigger value="listings">My Listings</TabsTrigger>
        </TabsList>
        <TabsContent value="bookings" className="mt-4">
          <Card className="border-border/50">
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border text-sm text-muted-foreground">
                      <th className="p-4 text-left font-medium">Service</th>
                      <th className="p-4 text-left font-medium">Type</th>
                      <th className="p-4 text-left font-medium">Client</th>
                      <th className="p-4 text-left font-medium">Date</th>
                      <th className="p-4 text-left font-medium">Status</th>
                      <th className="p-4 text-right font-medium">Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentBookings.map((b) => (
                      <tr key={b.id} className="border-b border-border/50 hover:bg-muted/30">
                        <td className="p-4 font-medium text-foreground">{b.service}</td>
                        <td className="p-4"><Badge variant="outline">{b.type}</Badge></td>
                        <td className="p-4 text-muted-foreground">{b.client}</td>
                        <td className="p-4 text-muted-foreground">{b.date}</td>
                        <td className="p-4"><Badge className={statusColor(b.status)}>{b.status}</Badge></td>
                        <td className="p-4 text-right font-semibold text-primary">{b.amount}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="listings" className="mt-4">
          <Card className="border-border/50">
            <CardContent className="p-8 text-center">
              <p className="text-muted-foreground">Your listings will appear here once you add them.</p>
              <Button className="mt-4 bg-gradient-gold text-primary-foreground">
                <Plus className="h-4 w-4 mr-2" /> Add Your First Listing
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  </Layout>
);

export default Dashboard;
