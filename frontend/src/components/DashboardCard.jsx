export default function DashboardCard({ title, icon: Icon, children, className = '' }) {
  return (
    <div className={`bg-white rounded-lg shadow p-4 ${className}`}>
      <div className="flex items-center mb-2">
        {Icon && <Icon className="mr-2 text-gray-500" />}
        <h2 className="text-lg font-semibold">{title}</h2>
      </div>
      {children}
    </div>
  );
}
