export default function CarePlatform() {
  return (
    <div className="relative w-screen h-screen overflow-hidden bg-bg px-[4vw] py-[4vh] font-body text-text">
      <div className="flex items-center justify-between border-b border-slate-200 pb-[2vh]"><div className="flex items-center gap-[1vw]"><div className="h-[2.1vw] w-[2.1vw] rounded-[0.45vw] bg-accent" /><p className="font-display text-[1.3vw] font-extrabold">medofile</p></div><p className="text-[1vw] font-bold tracking-[0.08em] text-muted">PRODUCT SURFACE</p></div>
      <div className="pt-[4.5vh]">
        <p className="text-[1.2vw] font-bold tracking-[0.12em] text-accent">THE PLATFORM</p>
        <h1 className="mt-[0.8vh] max-w-[72vw] font-display text-[4.2vw] font-extrabold leading-[1.08] tracking-[-0.045em]">One platform for the next step in care</h1>
      </div>
      <div className="relative mt-[4vh] grid grid-cols-5 gap-[1.25vw]">
        <div className="rounded-[1vw] border border-slate-200 bg-white p-[1.5vw] shadow-[0_0.5vw_1.4vw_rgba(30,58,95,0.05)]"><p className="font-display text-[2.4vw] font-extrabold text-accent">01</p><p className="mt-[1.5vh] text-[1.75vw] font-semibold leading-[1.3]">Discover doctors through searchable profiles</p></div>
        <div className="rounded-[1vw] border border-slate-200 bg-white p-[1.5vw] shadow-[0_0.5vw_1.4vw_rgba(30,58,95,0.05)]"><p className="font-display text-[2.4vw] font-extrabold text-accent">02</p><p className="mt-[1.5vh] text-[1.75vw] font-semibold leading-[1.3]">Ask the AI Health Assistant about symptoms and general wellness</p></div>
        <div className="rounded-[1vw] border border-slate-200 bg-white p-[1.5vw] shadow-[0_0.5vw_1.4vw_rgba(30,58,95,0.05)]"><p className="font-display text-[2.4vw] font-extrabold text-accent">03</p><p className="mt-[1.5vh] text-[1.75vw] font-semibold leading-[1.3]">Upload a prescription image for concise medicine and instruction extraction</p></div>
        <div className="rounded-[1vw] border border-slate-200 bg-white p-[1.5vw] shadow-[0_0.5vw_1.4vw_rgba(30,58,95,0.05)]"><p className="font-display text-[2.4vw] font-extrabold text-accent">04</p><p className="mt-[1.5vh] text-[1.75vw] font-semibold leading-[1.3]">Open a recommended doctor's profile directly from the conversation</p></div>
        <div className="rounded-[1vw] bg-text p-[1.5vw] text-white"><p className="font-display text-[2.4vw] font-extrabold text-teal-300">05</p><p className="mt-[1.5vh] text-[1.75vw] font-semibold leading-[1.3]">Book appointments through the same patient journey</p></div>
      </div>
      <div className="absolute bottom-[4vh] left-[4vw] right-[4vw] flex justify-between border-t border-slate-200 pt-[1.6vh] text-[1vw] font-medium text-slate-400"><span>Medofile Overview</span><span>03 / 08</span></div>
    </div>
  );
}