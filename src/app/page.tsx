import { Footer } from "./_component/footer"
import { Header } from "./_component/header"
import Main from "./_component/main"
import FeatureCards from "./_component/feature-cards"
import { HomeRedirect } from "./_component/home-redirect"

export default async function Landing(){
    return (
        <>
            <div className="relative isolate min-h-screen text-white overflow-x-hidden">
                <HomeRedirect />
                <div className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[42rem] bg-[radial-gradient(circle_at_top,rgba(164,93,255,0.18),transparent_55%)]" />
                <div className="pointer-events-none absolute left-1/4 top-20 -z-10 h-72 w-72 -translate-x-1/2 rounded-full bg-purple-600/15 blur-[120px]" />
                <div className="pointer-events-none absolute right-1/4 top-40 -z-10 h-80 w-80 translate-x-1/2 rounded-full bg-blue-600/10 blur-[140px]" />
                <Header/>
                <div className="h-20 md:h-24" />
                <Main/>
                <FeatureCards/>
                <Footer/>
            </div>
        </>
    )
}
