import { BookOpen, Heart, Search } from "lucide-react";

export default function Home() {
	return (
		<div>
			{/* Hero Section */}
			<section className="bg-gradient-to-b from-[hsl(152_20%_95%)] to-[hsl(150_15%_90%)] py-16 md:py-24">
				<div className="container mx-auto px-4 max-w-4xl text-center">
					<h1 className="text-4xl md:text-5xl font-bold mb-6 text-foreground font-[family-name:var(--font-heading)]">
						You've Served. Now Let Us Help You Find What You've Earned.
					</h1>
					<p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
						Discover benefits, connect with local organizations, and find the
						support you and your family deserve — all in one place.
					</p>
					<div className="flex gap-4 justify-center flex-wrap">
						<a
							href="/screening"
							className="inline-flex items-center justify-center rounded-md bg-[hsl(40_82%_55%)] text-[hsl(30_15%_12%)] px-6 py-3 font-semibold hover:bg-[hsl(40_82%_60%)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 transition-colors"
						>
							Find My Benefits
						</a>
						<a
							href="/directory"
							className="inline-flex items-center justify-center rounded-md bg-primary text-primary-foreground px-6 py-3 font-semibold hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 transition-colors"
						>
							Browse Directory
						</a>
					</div>
				</div>
			</section>

			{/* Features Section */}
			<section className="container mx-auto px-4 py-16 max-w-4xl">
				<h2 className="text-2xl font-semibold mb-8 text-center font-[family-name:var(--font-heading)]">
					How We Help
				</h2>
				<div className="grid gap-6 md:grid-cols-3">
					<div className="bg-card rounded-lg p-6 shadow-sm border border-border">
						<div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center mb-4">
							<Search className="h-5 w-5 text-primary" />
						</div>
						<h3 className="font-semibold text-lg mb-2 font-[family-name:var(--font-heading)]">
							Resource Directory
						</h3>
						<p className="text-muted-foreground">
							Search thousands of veteran-serving organizations across
							Kentucky.
						</p>
					</div>
					<div className="bg-card rounded-lg p-6 shadow-sm border border-border">
						<div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center mb-4">
							<BookOpen className="h-5 w-5 text-primary" />
						</div>
						<h3 className="font-semibold text-lg mb-2 font-[family-name:var(--font-heading)]">
							Benefits Screening
						</h3>
						<p className="text-muted-foreground">
							Quick questionnaire to identify programs you may qualify for.
						</p>
					</div>
					<div className="bg-card rounded-lg p-6 shadow-sm border border-border">
						<div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center mb-4">
							<Heart className="h-5 w-5 text-primary" />
						</div>
						<h3 className="font-semibold text-lg mb-2 font-[family-name:var(--font-heading)]">
							Personalized Support
						</h3>
						<p className="text-muted-foreground">
							Get matched to resources based on your specific situation.
						</p>
					</div>
				</div>
			</section>

			{/* Call to Action */}
			<section className="container mx-auto px-4 pb-16 max-w-4xl">
				<div className="bg-accent rounded-lg p-8 text-center">
					<h2 className="text-2xl font-semibold mb-4 font-[family-name:var(--font-heading)]">
						Ready to Get Started?
					</h2>
					<p className="text-muted-foreground mb-6">
						Explore our directory of resources or take a quick screening to find
						programs that match your needs.
					</p>
					<div className="flex gap-4 justify-center flex-wrap">
						<a
							href="/directory"
							className="inline-flex items-center justify-center rounded-md bg-primary text-primary-foreground px-6 py-3 font-medium hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 transition-colors"
						>
							Browse Directory
						</a>
						<a
							href="/screening"
							className="inline-flex items-center justify-center rounded-md border border-input bg-card px-6 py-3 font-medium hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 transition-colors"
						>
							Take Screening
						</a>
					</div>
				</div>
			</section>
		</div>
	);
}
