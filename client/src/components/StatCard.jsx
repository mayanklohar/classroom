const StatCard = ({ title, value, icon, color = 'blue', trend }) => {
  const colorClasses = {
    blue: 'from-blue-500 to-blue-600',
    green: 'from-green-500 to-green-600',
    purple: 'from-purple-500 to-purple-600',
    orange: 'from-orange-500 to-orange-600',
    red: 'from-red-500 to-red-600',
  };

  return (
    <div className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-200 hover:border-blue-300">
      <div className="flex items-center justify-between">
        {/* Icon on the left */}
        <div className="flex-shrink-0">
          <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${colorClasses[color]} text-white shadow-lg flex items-center justify-center`}>
            <span className="text-2xl">{icon}</span>
          </div>
        </div>
        
        {/* Content on the right */}
        <div className="text-right">
          <p className="text-xs font-medium text-gray-600 uppercase tracking-wider mb-1">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
          
          {trend && (
            <div className="flex items-center justify-end mt-1">
              <div className={`flex items-center space-x-1 text-xs font-medium px-2 py-0.5 rounded-full ${trend > 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d={trend > 0 ? "M3.293 9.707a1 1 0 010-1.414l6-6a1 1 0 011.414 0l6 6a1 1 0 01-1.414 1.414L11 5.414V17a1 1 0 11-2 0V5.414L4.707 9.707a1 1 0 01-1.414 0z" : "M16.707 10.293a1 1 0 010 1.414l-6 6a1 1 0 01-1.414 0l-6-6a1 1 0 111.414-1.414L9 14.586V3a1 1 0 012 0v11.586l4.293-4.293a1 1 0 011.414 0z"} clipRule="evenodd" />
                </svg>
                <span>{Math.abs(trend)}%</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default StatCard;
