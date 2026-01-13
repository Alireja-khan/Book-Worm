import { Facebook, Twitter, Instagram, Youtube, Github, BookOpen, Mail, MapPin, Phone } from 'lucide-react';
import { Button } from '@/components/ui/button';

const footerLinks = {
  Product: [
    { label: "Features", href: "#" },
    { label: "Pricing", href: "#" },
    { label: "API", href: "#" },
    { label: "Documentation", href: "#" }
  ],
  Company: [
    { label: "About", href: "#" },
    { label: "Blog", href: "#" },
    { label: "Careers", href: "#" },
    { label: "Press", href: "#" }
  ],
  Resources: [
    { label: "Help Center", href: "#" },
    { label: "Community", href: "#" },
    { label: "Tutorials", href: "#" },
    { label: "Webinars", href: "#" }
  ],
  Legal: [
    { label: "Privacy", href: "#" },
    { label: "Terms", href: "#" },
    { label: "Security", href: "#" },
    { label: "Cookies", href: "#" }
  ]
};

const socialLinks = [
  { icon: Facebook, label: "Facebook", href: "#" },
  { icon: Twitter, label: "Twitter", href: "#" },
  { icon: Instagram, label: "Instagram", href: "#" },
  { icon: Youtube, label: "YouTube", href: "#" },
  { icon: Github, label: "GitHub", href: "#" }
];

export default function FooterSection() {
  return (
    <footer className="bg-card border-t">
      <div className="container px-4 mx-auto py-12">
        {/* Main Footer Content */}
        <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-12 mb-12">
          {/* Brand Column */}
          <div className="lg:col-span-2">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center">
                <BookOpen className="h-6 w-6 text-primary-foreground" />
              </div>
              <div>
                <div className="text-2xl font-bold">BookWorm</div>
                <div className="text-sm text-muted-foreground">Personalized Reading Tracker</div>
              </div>
            </div>
            
            <p className="text-muted-foreground mb-8 max-w-md">
              Transform your reading journey with AI-powered recommendations, smart tracking, 
              and a community of passionate readers. Discover, track, and achieve your reading goals.
            </p>
            
            {/* Newsletter */}
            <div className="space-y-4">
              <div className="font-medium">Stay updated with reading tips</div>
              <div className="flex gap-2">
                <input
                  type="email"
                  placeholder="Your email"
                  className="flex-1 px-4 py-2 border rounded-lg bg-background"
                />
                <Button>Subscribe</Button>
              </div>
            </div>
          </div>

          {/* Links Columns */}
          {Object.entries(footerLinks).map(([category, links]) => (
            <div key={category}>
              <h3 className="font-semibold text-lg mb-4">{category}</h3>
              <ul className="space-y-3">
                {links.map((link) => (
                  <li key={link.label}>
                    <a
                      href={link.href}
                      className="text-muted-foreground hover:text-primary transition-colors"
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Contact Info */}
        <div className="grid md:grid-cols-3 gap-8 mb-12 py-8 border-y">
          <div className="flex items-center gap-3">
            <MapPin className="h-5 w-5 text-primary" />
            <div>
              <div className="font-medium">Location</div>
              <div className="text-sm text-muted-foreground">San Francisco, CA</div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Mail className="h-5 w-5 text-primary" />
            <div>
              <div className="font-medium">Email</div>
              <div className="text-sm text-muted-foreground">support@bookworm.com</div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Phone className="h-5 w-5 text-primary" />
            <div>
              <div className="font-medium">Phone</div>
              <div className="text-sm text-muted-foreground">+1 (555) 123-4567</div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} BookWorm. All rights reserved.
          </div>
          
          {/* Social Links */}
          <div className="flex items-center gap-4">
            {socialLinks.map((social) => (
              <a
                key={social.label}
                href={social.href}
                className="text-muted-foreground hover:text-primary transition-colors"
                aria-label={social.label}
              >
                <social.icon className="h-5 w-5" />
              </a>
            ))}
          </div>
          
          {/* Additional Links */}
          <div className="flex gap-6 text-sm">
            <a href="#" className="text-muted-foreground hover:text-primary">
              Privacy Policy
            </a>
            <a href="#" className="text-muted-foreground hover:text-primary">
              Terms of Service
            </a>
            <a href="#" className="text-muted-foreground hover:text-primary">
              Cookies
            </a>
          </div>
        </div>

        {/* App Store Badges */}
        <div className="flex justify-center gap-4 mt-8">
          <div className="border rounded-lg px-6 py-3 text-center hover:bg-secondary transition-colors cursor-pointer">
            <div className="text-xs text-muted-foreground">Download on the</div>
            <div className="font-bold">App Store</div>
          </div>
          <div className="border rounded-lg px-6 py-3 text-center hover:bg-secondary transition-colors cursor-pointer">
            <div className="text-xs text-muted-foreground">Get it on</div>
            <div className="font-bold">Google Play</div>
          </div>
        </div>
      </div>
    </footer>
  );
}