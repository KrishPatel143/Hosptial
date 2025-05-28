import { Badge } from "@/components/ui/badge"

export function StatusBadge({ status }) {
  // Handle empty or undefined status
  if (!status) {
    return (
      <Badge variant="outline" className="bg-gray-100 text-gray-700">
        Unknown
      </Badge>
    );
  }
  
  // Normalize status for consistent comparison
  const normalizedStatus = status.toLowerCase();
  
  // Get badge colors based on status
  let className = '';
  
  if (normalizedStatus === 'completed') {
    className = 'border-green-200 bg-green-50 text-green-700 hover:bg-green-100 hover:text-green-800';
  } else if (normalizedStatus === 'scheduled') {
    className = 'border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100 hover:text-blue-800';
  } else if (normalizedStatus === 'canceled') {
    className = 'border-red-200 bg-red-50 text-red-700 hover:bg-red-100 hover:text-red-800';
  } else if (normalizedStatus === 'pending') {
    className = 'border-purple-200 bg-purple-50 text-purple-700 hover:bg-purple-100 hover:text-purple-800';
  } else {
    className = 'border-gray-200 bg-gray-50 text-gray-700 hover:bg-gray-100 hover:text-gray-800';
  }
  
  // Format status for display (convert to title case)
  const displayStatus = status
    .split(/\s+/)
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');

  return (
    <Badge
      variant="outline"
      className={className}
    >
      {displayStatus}
    </Badge>
  )
}