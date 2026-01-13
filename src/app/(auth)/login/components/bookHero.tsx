import Image from 'next/image'

export default function BookHero() {
    return (
        <div className="relative mt-10 hidden lg:flex items-center justify-center">
            {/* Ground shadow */}
            <div className="hero-ground-shadow absolute bottom-32 h-16 w-80 blur-2xl opacity-90" />

            {/* Book */}
            <Image
                src="/alchemist.png"
                alt="The Alchemist Book"
                width={560}
                height={520}
                priority
                className="relative drop-shadow-[0_32px_48px_oklch(0.15_0.02_95_/_0.35)]"
            />
        </div>
    )
}