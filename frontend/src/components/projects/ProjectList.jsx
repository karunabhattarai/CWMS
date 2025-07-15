import ProjectCard from "./ProjectCard";

export default function ProjectList({
  projects,
  onEdit,
  onDelete,
  onView,
  statusStyles,
  getProjectStatusAndProgress,
}) {
  if (!projects.length)
    return (
      <div className="text-green-700 text-center font-serif py-8">
        No projects found.
      </div>
    );
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {projects.map((project) => (
        <ProjectCard
          key={project.id}
          project={project}
          onEdit={onEdit}
          onDelete={onDelete}
          onView={onView}
          statusStyles={statusStyles}
          getProjectStatusAndProgress={getProjectStatusAndProgress}
        />
      ))}
    </div>
  );
}
