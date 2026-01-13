import { Users, BookOpen, Star, TrendingUp, Clock, Award, Globe, Heart } from 'lucide-react';

const stats = [
  {
    icon: Users,
    value: "50,000+",
    label: "Active Readers",
    description: "Join our growing community",
    change: "+12% this month"
  },
  {
    icon: BookOpen,
    value: "1.2M",
    label: "Books Tracked",
    description: "Total pages read by community",
    change: "2M pages daily"
  },
  {
    icon: Star,
    value: "4.8",
    label: "Average Rating",
    description: "Based on 25K+ reviews",
    change: "98% satisfaction rate"
  },
  {
    icon: TrendingUp,
    value: "85%",
    label: "Increase in Reading",
    description: "Average user improvement",
    change: "More books finished"
  },
  {
    icon: Clock,
    value: "45 min",
    label: "Daily Average",
    description: "Reading time per user",
    change: "+15min from last year"
  },
  {
    icon: Award,
    value: "10K+",
    label: "Goals Achieved",
    description: "Annual reading targets met",
    change: "300% more than last year"
  },
  {
    icon: Globe,
    value: "150+",
    label: "Countries",
    description: "Readers from around the world",
    change: "New countries added"
  },
  {
    icon: Heart,
    value: "95%",
    label: "Retention Rate",
    description: "Users continue after 6 months",
    change: "Industry leading"
  }
];

export default function StatsSection() {
  return (
    <section className="py-20">
      <div className="container px-4 mx-auto">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Trusted by Readers Worldwide
          </h2>
          <p className="text-lg text-muted-foreground">
            See how BookWorm is transforming reading habits and helping readers achieve their goals.
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {stats.map((stat, index) => (
            <div
              key={index}
              className="bg-card border rounded-xl p-6 text-center group hover:shadow-lg transition-shadow duration-300"
            >
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4 group-hover:scale-110 transition-transform duration-300">
                <stat.icon className="h-8 w-8 text-primary" />
              </div>
              
              <div className="mb-2">
                <div className="text-3xl md:text-4xl font-bold">{stat.value}</div>
                <div className="text-sm font-medium text-primary mt-1">{stat.label}</div>
              </div>
              
              <p className="text-sm text-muted-foreground mb-2">{stat.description}</p>
              <div className="text-xs font-medium text-green-500 bg-green-500/10 py-1 px-2 rounded-full inline-block">
                {stat.change}
              </div>
            </div>
          ))}
        </div>

        {/* Progress bars for visual stats */}
        <div className="mt-16 grid md:grid-cols-2 gap-8">
          <div className="space-y-6">
            <div>
              <div className="flex justify-between mb-2">
                <span className="font-medium">Fiction Readers</span>
                <span className="text-primary font-bold">68%</span>
              </div>
              <div className="h-3 bg-secondary rounded-full overflow-hidden">
                <div className="h-full bg-purple-500 rounded-full w-2/3"></div>
              </div>
            </div>
            
            <div>
              <div className="flex justify-between mb-2">
                <span className="font-medium">Non-Fiction Readers</span>
                <span className="text-primary font-bold">42%</span>
              </div>
              <div className="h-3 bg-secondary rounded-full overflow-hidden">
                <div className="h-full bg-blue-500 rounded-full w-2/5"></div>
              </div>
            </div>
          </div>
          
          <div className="space-y-6">
            <div>
              <div className="flex justify-between mb-2">
                <span className="font-medium">Daily Active Users</span>
                <span className="text-primary font-bold">92%</span>
              </div>
              <div className="h-3 bg-secondary rounded-full overflow-hidden">
                <div className="h-full bg-green-500 rounded-full w-[92%]"></div>
              </div>
            </div>
            
            <div>
              <div className="flex justify-between mb-2">
                <span className="font-medium">Reading Goals Met</span>
                <span className="text-primary font-bold">78%</span>
              </div>
              <div className="h-3 bg-secondary rounded-full overflow-hidden">
                <div className="h-full bg-orange-500 rounded-full w-3/4"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}