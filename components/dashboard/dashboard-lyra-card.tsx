type DashboardLyraCardProps = {
  mensagem: string;
};

export function DashboardLyraCard({
  mensagem,
}: DashboardLyraCardProps) {
  if (!mensagem) return null;

  return (
    <aside className="rounded-[30px] border border-fuchsia-300/20 bg-fuchsia-400/10 p-5">
      <div className="flex items-center gap-3">
        <div className="grid h-12 w-12 place-items-center rounded-[20px] bg-gradient-to-br from-fuchsia-500 to-blue-600 text-xl">
          ✦
        </div>

        <div>
          <p className="font-black text-white">Lyra</p>
          <p className="text-xs text-slate-300">
            estrategia de hoje
          </p>
        </div>
      </div>

      <p className="mt-4 text-sm leading-7 text-slate-200">
        {mensagem}
      </p>
    </aside>
  );
}
