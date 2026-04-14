import { landingFeatureCards } from "@/config/const/components.const";

export function FeatureCards() {
    return (
        <section className="section-shell py-16">
            <div className="grid grid-cols-1 gap-8">
                {landingFeatureCards.map((card) => (
                    <article
                        key={card.title}
                        className="group relative overflow-hidden rounded-2xl border border-purple-500/20 bg-gradient-to-br from-purple-600/20 to-purple-900/20 p-8 backdrop-blur-sm transition-all duration-300 hover:border-purple-500/40"
                    >
                        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:gap-6">
                            <div className="flex items-center gap-4 sm:block sm:flex-shrink-0">
                                <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-gradient-to-br from-purple-500 to-purple-700">
                                    {card.icon}
                                </div>
                                <h3 className="text-lg font-semibold uppercase tracking-wide text-white sm:hidden">
                                    {card.title}
                                </h3>
                            </div>

                            <div className="sm:flex-1">
                                <h3 className="hidden text-lg font-semibold uppercase tracking-wide text-white sm:block">
                                    {card.title}
                                </h3>
                                <p className="text-sm text-gray-300 sm:mt-2">
                                    {card.description}
                                </p>
                            </div>
                        </div>
                    </article>
                ))}
            </div>
        </section>
    );
}