import { Bell, Database, LayoutDashboard } from 'lucide-react';

const FeaturesSection = () => {
    return (
        <section className="pb-20">
          <div className="container">
            <h2 className="text-3xl font-bold text-center mb-12">Everything You Need</h2>
            <div className="grid md:grid-cols-3 gap-8">
              <div className="bg-card p-6 rounded-lg border shadow-sm">
                <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                  <Database className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-3">Notion-like Database</h3>
                <p className="text-muted-foreground">
                  Track applications in a customizable database with properties, tags, and filters.
                </p>
              </div>
              <div className="bg-card p-6 rounded-lg border shadow-sm">
                <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                  <LayoutDashboard className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-3">Multiple Views</h3>
                <p className="text-muted-foreground">
                  Switch between table, board, calendar, and list views.
                </p>
              </div>
              <div className="bg-card p-6 rounded-lg border shadow-sm">
                <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                  <Bell className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-3">Smart Reminders</h3>
                <p className="text-muted-foreground">
                  Never miss a follow-up with automated reminders.
                </p>
              </div>
            </div>
          </div>
        </section>
    );
};

export default FeaturesSection;