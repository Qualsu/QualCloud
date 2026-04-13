import { Footer } from "./_component/footer"
import { Header } from "./_component/header"
import Main from "./_component/main"

export default async function Landing(){
    return (
        <div className="relative isolate min-h-screen text-white">
            <div className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[32rem] bg-[radial-gradient(circle_at_top,rgba(164,93,255,0.16),transparent_55%)]"/>
            <Header/>
            <div className="h-20 md:h-24" />
            <Main/>
            <Footer/>
        </div>
    )
}