export default function HealthAssistant() {
  return (
    <div className="relative w-screen h-screen overflow-hidden bg-bg px-[4vw] py-[4vh] font-body text-text">
      <div className="flex items-center justify-between border-b border-slate-200 pb-[2vh]"><div className="flex items-center gap-[1vw]"><div className="h-[2.1vw] w-[2.1vw] rounded-[0.45vw] bg-accent" /><p className="font-display text-[1.3vw] font-extrabold">medofile</p></div><p className="text-[1vw] font-bold tracking-[0.08em] text-muted">AI ASSISTANCE</p></div>
      <div className="grid h-[76vh] grid-cols-[0.85fr_1.15fr] gap-[4vw] pt-[5vh]">
        <div className="flex flex-col justify-center"><p className="text-[1.2vw] font-bold tracking-[0.12em] text-accent">CONVERSATIONAL GUIDANCE</p><h1 className="mt-[1vh] font-display text-[4.8vw] font-extrabold leading-[1.05] tracking-[-0.05em]">AI Health Assistant</h1></div>
        <div className="my-[3vh] rounded-[1.2vw] border border-slate-200 bg-white p-[2vw] shadow-[0_0.6vw_1.6vw_rgba(30,58,95,0.06)]">
          <div className="flex items-center justify-between border-b border-slate-200 pb-[1.4vh]"><p className="font-display text-[1.7vw] font-bold">Care guidance flow</p><span className="rounded-full bg-[#e8f5f3] px-[1vw] py-[0.5vh] text-[1.1vw] font-bold text-accent">STREAMED</span></div>
          <div className="mt-[2vh] space-y-[1.35vh]">
            <div className="rounded-[0.7vw] bg-slate-100 px-[1.3vw] py-[1.2vh] text-[1.8vw] font-medium">Explains possible causes without presenting a diagnosis</div>
            <div className="rounded-[0.7vw] bg-slate-100 px-[1.3vw] py-[1.2vh] text-[1.8vw] font-medium">Identifies the type of specialist that may be relevant</div>
            <div className="rounded-[0.7vw] bg-[#e8f5f3] px-[1.3vw] py-[1.2vh] text-[1.8vw] font-semibold text-text">Adds Medofile doctor recommendations below the response</div>
            <div className="rounded-[0.7vw] bg-slate-100 px-[1.3vw] py-[1.2vh] text-[1.8vw] font-medium">Uses streamed responses for a conversational experience</div>
            <div className="rounded-[0.7vw] bg-slate-100 px-[1.3vw] py-[1.2vh] text-[1.8vw] font-medium">Provides emergency guidance for serious symptoms</div>
          </div>
        </div>
      </div>
      <div className="flex justify-between border-t border-slate-200 pt-[1.6vh] text-[1vw] font-medium text-slate-400"><span>Medofile Overview</span><span>04 / 08</span></div>
    </div>
  );
}