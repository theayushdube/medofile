export default function Architecture() {
  return (
    <div className="relative w-screen h-screen overflow-hidden bg-bg px-[4vw] py-[4vh] font-body text-text">
      <div className="flex items-center justify-between border-b border-slate-200 pb-[2vh]"><div className="flex items-center gap-[1vw]"><div className="h-[2.1vw] w-[2.1vw] rounded-[0.45vw] bg-accent" /><p className="font-display text-[1.3vw] font-extrabold">medofile</p></div><p className="text-[1vw] font-bold tracking-[0.08em] text-muted">SYSTEM DESIGN</p></div>
      <div className="pt-[4vh]"><p className="text-[1.2vw] font-bold tracking-[0.12em] text-accent">CONNECTED SERVICES</p><h1 className="mt-[1vh] font-display text-[4.1vw] font-extrabold tracking-[-0.045em]">Built across web, mobile, and API services</h1></div>
      <div className="mt-[4vh] grid grid-cols-3 gap-[1.8vw]">
        <div className="rounded-[1vw] border border-slate-200 bg-white p-[2vw]"><p className="font-display text-[2.3vw] font-extrabold text-accent">WEB</p><p className="mt-[2vh] text-[1.85vw] font-semibold leading-[1.32]">React web experience for discovery, chat, registration, and profile management</p></div>
        <div className="rounded-[1vw] border border-slate-200 bg-white p-[2vw]"><p className="font-display text-[2.3vw] font-extrabold text-accent">MOBILE</p><p className="mt-[2vh] text-[1.85vw] font-semibold leading-[1.32]">Expo mobile experience for patients and doctors</p></div>
        <div className="rounded-[1vw] bg-text p-[2vw] text-white"><p className="font-display text-[2.3vw] font-extrabold text-teal-300">API</p><p className="mt-[2vh] text-[1.85vw] font-semibold leading-[1.32]">Express API with PostgreSQL-backed doctor and booking data</p></div>
      </div>
      <div className="mt-[2.2vh] grid grid-cols-2 gap-[1.8vw]"><div className="rounded-[1vw] bg-[#e8f5f3] p-[1.8vw] text-[1.85vw] font-semibold leading-[1.32]">SSE streaming keeps AI responses and recommendation metadata synchronized</div><div className="rounded-[1vw] border border-slate-200 bg-white p-[1.8vw] text-[1.85vw] font-semibold leading-[1.32]">OpenAPI-generated client contracts support shared API integration</div></div>
      <div className="absolute bottom-[4vh] left-[4vw] right-[4vw] flex justify-between border-t border-slate-200 pt-[1.6vh] text-[1vw] font-medium text-slate-400"><span>Medofile Overview</span><span>07 / 08</span></div>
    </div>
  );
}