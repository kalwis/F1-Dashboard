export default function DashboardCard({ title, icon: Icon, children, className = '' }) {
  return (
    <div className={`bg-black/20 backdrop-blur-md border border-white/10 rounded-lg shadow-xl p-4 ${className}`}>
      <div className="flex items-center mb-2">
        {Icon && <Icon className="mr-2 text-white/80" />}
        <h2 className="text-lg font-semibold text-white">{title}</h2>
      </div>
      {children}
    </div>
  );
}
