import { Upload, FolderOpen, Share2 } from "lucide-react"

const steps = [
    {
        step: 1,
        title: "Загружайте файлы",
        description: "Просто перетащите или выберите файлы — они сразу попадут в ваше облачное хранилище",
        icon: Upload,
    },
    {
        step: 2,
        title: "Организуйте порядок",
        description: "Создавайте папки, сортируйте по типам и добавляйте важное в избранное",
        icon: FolderOpen,
    },
    {
        step: 3,
        title: "Делитесь с кем угодно",
        description: "Отправляйте ссылки на файлы — получателю не нужна регистрация",
        icon: Share2,
    },
]

export function HowItWorks() {
    return (
        <section className="section-shell py-12">
            <div className="mb-10 text-center">
                <h2 className="text-xl font-semibold text-white sm:text-2xl">
                    Как это работает
                </h2>
                <p className="mt-2 text-sm text-white/50 sm:text-base">
                    Три простых шага
                </p>
            </div>

            <div className="relative grid grid-cols-1 gap-8 md:grid-cols-3">
                {steps.map((s) => (
                    <div key={s.step} className="group relative">
                        <div className="relative z-10 flex flex-col items-center gap-4 text-center">
                            <div className="flex h-14 w-14 items-center justify-center rounded-xl border border-purple-500/20 bg-gradient-to-br from-purple-600/20 to-purple-900/20 backdrop-blur-sm transition-all duration-300 group-hover:border-purple-400/30 group-hover:shadow-[0_0_30px_rgba(139,92,246,0.12)]">
                                <s.icon size={24} className="text-purple-300" />
                            </div>
                            <div className="flex h-7 w-7 items-center justify-center rounded-full border border-white/10 bg-white/[0.04] text-xs font-medium text-white/60">
                                {s.step}
                            </div>
                            <div>
                                <h3 className="text-base font-medium text-white">
                                    {s.title}
                                </h3>
                                <p className="mt-1.5 text-sm leading-relaxed text-white/50">
                                    {s.description}
                                </p>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </section>
    )
}
