export default function SharedProfiles() {
  return (
    <div className="relative w-screen h-screen overflow-hidden bg-bg px-[4vw] py-[4vh] font-body text-text">
      <div className="flex items-center justify-between border-b border-slate-200 pb-[2vh]"><div className="flex items-center gap-[1vw]"><div className="h-[2.1vw] w-[2.1vw] rounded-[0.45vw] bg-accent" /><p className="font-display text-[1.3vw] font-extrabold">medofile</p></div><p className="text-[1vw] font-bold tracking-[0.08em] text-muted">DOCTOR NETWORK</p></div>
      <div className="pt-[4vh]"><p className="text-[1.2vw] font-bold tracking-[0.12em] text-accent">SHARED DATA MODEL</p><h1 className="mt-[1vh] max-w-[80vw] font-display text-[4.1vw] font-extrabold leading-[1.08] tracking-[-0.045em]">Doctor profiles are the shared source of truth</h1></div>
      <div className="mt-[3.5vh] grid grid-cols-[1.05fr_0.95fr] gap-[2vw]">
        <div className="rounded-[1vw] border border-slate-200 bg-white p-[2vw] shadow-[0_0.5vw_1.4vw_rgba(30,58,95,0.05)]"><p className="text-[1.8vw] font-semibold">Doctor records are stored in the API database</p><div className="my-[2vh] h-px bg-slate-200" /><p className="text-[1.8vw] font-semibold">Web cards, full profiles, AI suggestions, and mobile views use the same records</p><div className="my-[2vh] h-px bg-slate-200" /><p className="text-[1.8vw] font-semibold">Doctors can register and manage their profile information</p></div>
        <div className="rounded-[1vw] bg-[#e8f5f3] p-[2vw]"><p className="text-[1.8vw] font-semibold">Profile updates include qualifications, specialties, clinic details, services, education, and availability</p><div className="my-[2vh] h-px bg-teal-700/15" /><p className="text-[1.8vw] font-semibold">Patients can click a recommendation to open the doctor's profile</p><div className="mt-[4vh] flex items-center gap-[1.2vw]"><div className="h-[3.5vw] w-[3.5vw] rounded-full bg-accent" /><div><p className="text-[1.3vw] font-bold tracking-[0.08em] text-accent">ONE RECORD</p><p className="text-[2vw] font-bold">Many patient touchpoints</p></div></div></div>
      </div>
      <div className="absolute bottom-[4vh] left-[4vw] right-[4vw] flex justify-between border-t border-slate-200 pt-[1.6vh] text-[1vw] font-medium text-slate-400"><span>Medofile Overview</span><span>06 / 08</span></div>
    </div>
  );
}