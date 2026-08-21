export default function FragmentedJourneys() {
  return (
    <div className="relative w-screen h-screen overflow-hidden bg-bg px-[4vw] py-[4vh] font-body text-text">
      <div className="flex items-center justify-between border-b border-slate-200 pb-[2vh]">
        <div className="flex items-center gap-[1vw]"><div className="h-[2.1vw] w-[2.1vw] rounded-[0.45vw] bg-accent" /><p className="font-display text-[1.3vw] font-extrabold">medofile</p></div>
        <p className="text-[1vw] font-bold tracking-[0.08em] text-muted">PATIENT EXPERIENCE</p>
      </div>
      <div className="grid h-[77vh] grid-cols-[0.9fr_1.1fr] gap-[4vw] pt-[5vh]">
        <div className="flex flex-col justify-center">
          <p className="text-[1.2vw] font-bold tracking-[0.12em] text-accent">THE CONTEXT</p>
          <h1 className="mt-[1vh] font-display text-[4.35vw] font-extrabold leading-[1.08] tracking-[-0.045em]">Healthcare journeys are fragmented</h1>
          <div className="mt-[3vh] h-[0.6vh] w-[10vw] bg-accent" />
        </div>
        <div className="grid content-center grid-cols-2 gap-[1.6vw]">
          <div className="rounded-[1vw] border border-slate-200 bg-white p-[2vw] shadow-[0_0.5vw_1.4vw_rgba(30,58,95,0.05)]"><p className="text-[1.1vw] font-bold text-accent">01</p><p className="mt-[1.4vh] text-[2vw] font-semibold leading-[1.28]">Patients need one place to describe symptoms and find appropriate care</p></div>
          <div className="rounded-[1vw] border border-slate-200 bg-white p-[2vw] shadow-[0_0.5vw_1.4vw_rgba(30,58,95,0.05)]"><p className="text-[1.1vw] font-bold text-accent">02</p><p className="mt-[1.4vh] text-[2vw] font-semibold leading-[1.28]">Prescription information can be difficult to understand</p></div>
          <div className="rounded-[1vw] border border-slate-200 bg-white p-[2vw] shadow-[0_0.5vw_1.4vw_rgba(30,58,95,0.05)]"><p className="text-[1.1vw] font-bold text-accent">03</p><p className="mt-[1.4vh] text-[2vw] font-semibold leading-[1.28]">Doctor discovery, profile details, and booking should stay connected</p></div>
          <div className="rounded-[1vw] border border-slate-200 bg-[#e8f5f3] p-[2vw]"><p className="text-[1.1vw] font-bold text-accent">04</p><p className="mt-[1.4vh] text-[2vw] font-semibold leading-[1.28]">Users should be able to browse care without being forced to register</p></div>
        </div>
      </div>
      <div className="flex justify-between border-t border-slate-200 pt-[1.6vh] text-[1vw] font-medium text-slate-400"><span>Medofile Overview</span><span>02 / 08</span></div>
    </div>
  );
}