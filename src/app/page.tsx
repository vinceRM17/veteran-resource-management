export default function Home() {
	return (
		<div className="container mx-auto px-4 py-12">
			<div className="max-w-4xl mx-auto">
				{/* Hero Section */}
				<section className="mb-12">
					<h1 className="text-4xl font-bold mb-4">
						Connecting Veterans to Resources
					</h1>
					<p className="text-lg text-muted-foreground mb-6">
						Find the support, programs, and services you've earned. Our platform
						helps Kentucky veterans and their families discover organizations
						and benefits tailored to their unique needs.
					</p>
				</section>

				{/* Features Overview */}
				<section className="mb-12">
					<h2 className="text-2xl font-semibold mb-6">How We Help</h2>
					<div className="grid gap-6 md:grid-cols-3">
						<div className="border rounded-lg p-6">
							<h3 className="font-semibold text-lg mb-2">Resource Directory</h3>
							<p className="text-muted-foreground">
								Search thousands of veteran-serving organizations across
								Kentucky.
							</p>
						</div>
						<div className="border rounded-lg p-6">
							<h3 className="font-semibold text-lg mb-2">Benefits Screening</h3>
							<p className="text-muted-foreground">
								Quick questionnaire to identify programs you may qualify for.
							</p>
						</div>
						<div className="border rounded-lg p-6">
							<h3 className="font-semibold text-lg mb-2">
								Personalized Support
							</h3>
							<p className="text-muted-foreground">
								Get matched to resources based on your specific situation.
							</p>
						</div>
					</div>
				</section>

				{/* Call to Action */}
				<section className="bg-secondary rounded-lg p-8 text-center">
					<h2 className="text-2xl font-semibold mb-4">Ready to Get Started?</h2>
					<p className="text-muted-foreground mb-6">
						Explore our directory of resources or take a quick screening to find
						programs that match your needs.
					</p>
					<div className="flex gap-4 justify-center flex-wrap">
						<a
							href="/directory"
							className="inline-flex items-center justify-center rounded-md bg-primary text-primary-foreground px-6 py-3 font-medium hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
						>
							Browse Directory
						</a>
						<a
							href="/screening"
							className="inline-flex items-center justify-center rounded-md border border-input bg-background px-6 py-3 font-medium hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
						>
							Take Screening
						</a>
					</div>
				</section>
			</div>
		</div>
	);
}
