export default function ConnectedCare() {
  return (
    <div className="relative w-screen h-screen overflow-hidden bg-bg px-[4vw] py-[4vh] font-body text-text">
      <div className="flex items-center justify-between border-b border-slate-200 pb-[2vh]"><div className="flex items-center gap-[1vw]"><div className="h-[2.1vw] w-[2.1vw] rounded-[0.45vw] bg-accent" /><p className="font-display text-[1.3vw] font-extrabold">medofile</p></div><p className="text-[1vw] font-bold tracking-[0.08em] text-muted">CLOSING VIEW</p></div>
      <div className="grid h-[76vh] grid-cols-[1fr_0.9fr] gap-[4vw] pt-[5vh]">
        <div className="flex flex-col justify-center"><p className="text-[1.2vw] font-bold tracking-[0.12em] text-accent">THE DIRECTION</p><h1 className="mt-[1vh] font-display text-[4.7vw] font-extrabold leading-[1.06] tracking-[-0.05em]">A safer, more connected care experience</h1><div className="mt-[3vh] h-[0.6vh] w-[10vw] bg-accent" /></div>
        <div className="my-[2vh] space-y-[1.3vh]">
          <div className="rounded-[0.9vw] border border-slate-200 bg-white px-[1.6vw] py-[1.45vh] text-[1.75vw] font-semibold">Open access by default; registration remains optional</div>
          <div className="rounded-[0.9vw] border border-slate-200 bg-white px-[1.6vw] py-[1.45vh] text-[1.75vw] font-semibold">Clear distinction between possibilities and medical diagnosis</div>
          <div className="rounded-[0.9vw] border border-slate-200 bg-white px-[1.6vw] py-[1.45vh] text-[1.75vw] font-semibold">Protected administrative tools for verified management actions</div>
          <div className="rounded-[0.9vw] bg-[#e8f5f3] px-[1.6vw] py-[1.45vh] text-[1.75vw] font-semibold">Doctor recommendations link directly to actionable profiles</div>
          <div className="rounded-[0.9vw] bg-text px-[1.6vw] py-[1.45vh] text-[1.75vw] font-semibold text-white">Next focus: keep improving recommendation relevance, booking continuity, and production publishing reliability</div>
        </div>
      </div>
      <div className="flex justify-between border-t border-slate-200 pt-[1.6vh] text-[1vw] font-medium text-slate-400"><span>Medofile Overview</span><span>08 / 08</span></div>
    </div>
  );
}