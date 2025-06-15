export default function ProjectSearchFilter({
  search,
  setSearch,
  statusFilter,
  setStatusFilter,
  dateSort,
  setDateSort,
}) {
  return (
    <div className="flex flex-col md:flex-row md:items-center gap-4 mb-6">
      <input
        type="text"
        placeholder="Search projects..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="px-4 py-2 rounded border border-green-200 bg-white font-sans w-full md:w-1/3"
      />
      <select
        value={statusFilter}
        onChange={(e) => setStatusFilter(e.target.value)}
        className="px-4 py-2 rounded border border-green-200 bg-white font-sans"
      >
        <option value="all">All Statuses</option>
        <option value="completed">Completed</option>
        <option value="inprogress">In Progress</option>
        <option value="scheduled">Scheduled</option>
        <option value="delayed">Delayed</option>
      </select>
      <select
        value={dateSort}
        onChange={(e) => setDateSort(e.target.value)}
        className="px-4 py-2 rounded border border-green-200 bg-white font-sans"
      >
        <option value="newest">Newest First</option>
        <option value="oldest">Oldest First</option>
      </select>
    </div>
  );
}
