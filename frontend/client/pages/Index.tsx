import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function Index() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const features = [
    {
      icon: "🧠",
      title: "Smart Algorithm Analysis",
      description:
        "Get instant explanations of complex algorithms with step-by-step breakdowns and time complexity analysis.",
    },
    {
      icon: "⚡",
      title: "Real-time Code Optimization",
      description:
        "Optimize your code with AI-powered suggestions for better performance and cleaner implementations.",
    },
    {
      icon: "📊",
      title: "Visual Data Structures",
      description:
        "Interactive visualizations help you understand how data structures work in real-time.",
    },
    {
      icon: "🎯",
      title: "Interview Preparation",
      description:
        "Practice coding interviews with curated problems and instant feedback from our AI mentor.",
    },
  ];

  const stats = [
    { value: "10K+", label: "Problems Solved" },
    { value: "95%", label: "Success Rate" },
    { value: "24/7", label: "AI Support" },
    { value: "1M+", label: "Happy Users" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-tech-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      {/* Header */}
      <header className="relative z-10 px-6 py-4 border-b border-border/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link to="/" className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-r from-primary to-tech-500 rounded-lg flex items-center justify-center">
              <span className="text-xl font-bold text-primary-foreground">
                DS
              </span>
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-primary to-tech-500 bg-clip-text text-transparent">
              DSA ChatBot
            </span>
          </Link>
          <div className="flex items-center space-x-4">
            <Button variant="ghost" asChild className="hover:bg-primary/10">
              <Link to="/signin">Sign In</Link>
            </Button>
            <Button
              asChild
              className="bg-gradient-to-r from-primary to-tech-500 hover:from-primary/90 hover:to-tech-500/90"
            >
              <Link to="/signup">Get Started</Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10">
        {/* Hero Section */}
        <section className="px-6 py-20 text-center">
          <div
            className={`max-w-4xl mx-auto transform transition-all duration-1000 ${isVisible ? "translate-y-0 opacity-100" : "translate-y-10 opacity-0"}`}
          >
            <Badge className="mb-6 bg-primary/10 text-primary hover:bg-primary/20">
              🚀 AI-Powered Learning
            </Badge>
            <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-foreground via-primary to-tech-500 bg-clip-text text-transparent leading-tight">
              Master Data Structures &amp; Algorithms
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground mb-8 max-w-3xl mx-auto leading-relaxed">
              Your AI-powered mentor for conquering coding interviews and
              mastering algorithmic thinking. Get personalized guidance,
              real-time explanations, and interactive learning experiences.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
              <Button
                size="lg"
                asChild
                className="text-lg px-8 py-6 bg-gradient-to-r from-primary to-tech-500 hover:from-primary/90 hover:to-tech-500/90 shadow-lg hover:shadow-xl transition-all duration-300"
              >
                <Link to="/signup">Start Learning Now</Link>
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="text-lg px-8 py-6 border-primary/50 hover:bg-primary/10"
              >
                Watch Demo
              </Button>
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="px-6 py-16">
          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {stats.map((stat, index) => (
                <div
                  key={index}
                  className={`text-center transform transition-all duration-700 delay-${index * 200} ${isVisible ? "translate-y-0 opacity-100" : "translate-y-10 opacity-0"}`}
                >
                  <div className="text-3xl md:text-4xl font-bold text-primary mb-2">
                    {stat.value}
                  </div>
                  <div className="text-muted-foreground">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="px-6 py-20">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-foreground to-primary bg-clip-text text-transparent">
                Powerful Features
              </h2>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                Everything you need to excel in data structures and algorithms,
                powered by cutting-edge AI technology.
              </p>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              {features.map((feature, index) => (
                <Card
                  key={index}
                  className={`group hover:shadow-xl transition-all duration-500 border-border/50 bg-card/50 backdrop-blur-sm hover:bg-card/80 transform ${isVisible ? "translate-y-0 opacity-100" : "translate-y-10 opacity-0"}`}
                  style={{ transitionDelay: `${index * 100}ms` }}
                >
                  <CardHeader className="text-center pb-4">
                    <div className="text-4xl mb-4 group-hover:scale-110 transition-transform duration-300">
                      {feature.icon}
                    </div>
                    <CardTitle className="text-xl group-hover:text-primary transition-colors">
                      {feature.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-center leading-relaxed">
                      {feature.description}
                    </CardDescription>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="px-6 py-20">
          <div className="max-w-4xl mx-auto text-center">
            <Card className="bg-gradient-to-r from-primary/10 to-tech-500/10 border-primary/20 backdrop-blur-sm">
              <CardContent className="p-12">
                <h3 className="text-3xl md:text-4xl font-bold mb-6 bg-gradient-to-r from-primary to-tech-500 bg-clip-text text-transparent">
                  Ready to Transform Your Coding Skills?
                </h3>
                <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
                  Join thousands of developers who have already mastered DSA
                  with our AI-powered platform.
                </p>
                <Button
                  size="lg"
                  asChild
                  className="text-lg px-12 py-6 bg-gradient-to-r from-primary to-tech-500 hover:from-primary/90 hover:to-tech-500/90 shadow-lg hover:shadow-xl transition-all duration-300"
                >
                  <Link to="/signup">Start Your Journey</Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="relative z-10 px-6 py-12 border-t border-border/50 bg-card/30 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto text-center">
          <div className="flex items-center justify-center space-x-3 mb-6">
            <div className="w-8 h-8 bg-gradient-to-r from-primary to-tech-500 rounded-lg flex items-center justify-center">
              <span className="text-sm font-bold text-primary-foreground">
                DS
              </span>
            </div>
            <span className="text-lg font-bold bg-gradient-to-r from-primary to-tech-500 bg-clip-text text-transparent">
              DSA ChatBot
            </span>
          </div>
          <p className="text-muted-foreground">
            © 2024 DSA ChatBot. Empowering developers with AI-driven learning.
          </p>
        </div>
      </footer>
    </div>
  );
}
