const base = import.meta.env.BASE_URL;

export default function MedofileTitle() {
  return (
    <div className="relative w-screen h-screen overflow-hidden bg-bg px-[4vw] py-[4vh] font-body text-text">
      <div className="flex items-center justify-between border-b border-slate-200 pb-[2vh]">
        <div className="flex items-center gap-[1vw]">
          <div className="flex h-[2.3vw] w-[2.3vw] items-center justify-center rounded-[0.5vw] bg-accent font-display text-[1.3vw] font-extrabold text-white">M</div>
          <p className="font-display text-[1.35vw] font-extrabold tracking-[0.02em]">medofile</p>
        </div>
        <div className="flex gap-[2vw] text-[1vw] font-semibold tracking-[0.08em] text-muted">
          <span>PRODUCT OVERVIEW</span>
          <span>2026</span>
        </div>
      </div>

      <div className="grid h-[76vh] grid-cols-[1.12fr_0.88fr] gap-[4vw] pt-[5vh]">
        <div className="flex flex-col justify-center">
          <p className="mb-[1vh] text-[1.25vw] font-bold tracking-[0.12em] text-accent">CONNECTED CARE</p>
          <h1 className="max-w-[45vw] font-display text-[5.8vw] font-extrabold leading-[1.02] tracking-[-0.055em] text-text">Medofile</h1>
          <p className="mt-[2vh] max-w-[47vw] text-[2vw] leading-[1.35] text-slate-600">A connected healthcare experience for patients and doctors</p>
          <p className="mt-[1vh] max-w-[46vw] text-[1.55vw] leading-[1.45] text-muted">AI assistance, doctor discovery, and care coordination across web and mobile</p>
          <div className="mt-[4vh] grid grid-cols-2 gap-[1.4vw]">
            <div className="rounded-[1vw] border border-slate-200 bg-white px-[1.7vw] py-[2vh] shadow-[0_0.6vw_1.6vw_rgba(30,58,95,0.06)]">
              <p className="font-display text-[2vw] font-bold text-text">AI assistance</p>
            </div>
            <div className="rounded-[1vw] border border-slate-200 bg-white px-[1.7vw] py-[2vh] shadow-[0_0.6vw_1.6vw_rgba(30,58,95,0.06)]">
              <p className="font-display text-[2vw] font-bold text-text">Doctor discovery</p>
            </div>
          </div>
        </div>
        <div className="my-[4vh] overflow-hidden rounded-[1.2vw] border border-slate-200 bg-white p-[1vw] shadow-[0_0.7vw_1.8vw_rgba(30,58,95,0.08)]">
          <div className="relative h-full overflow-hidden rounded-[0.8vw]">
            <img src={`${base}medofile-hero.jpg`} crossOrigin="anonymous" alt="Doctor and patient reviewing care options" className="h-full w-full object-cover" />
            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-[#102b4b]/90 via-[#102b4b]/30 to-transparent px-[2vw] pb-[2.5vh] pt-[12vh]">
              <p className="font-display text-[2vw] font-bold leading-[1.2] text-white">Care coordination across web and mobile</p>
            </div>
          </div>
        </div>
      </div>
      <div className="flex items-center justify-between border-t border-slate-200 pt-[1.6vh] text-[1vw] font-medium text-slate-400">
        <span>Medofile Overview</span><span>01 / 08</span>
      </div>
    </div>
  );
}