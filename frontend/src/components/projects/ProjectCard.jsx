import { Card, CardHeader, CardTitle, CardActions } from "../common/Card";
import ProgressBar from "../common/ProgressBar";
import StatusBadge from "../common/StatusBadge";
import { AvatarGroup } from "../common/Avatar";
import { Button } from "../common/Button";

export default function ProjectCard({
  project,
  onEdit,
  onDelete,
  onView,
  statusStyles,
  getProjectStatusAndProgress,
}) {
  const { status, progress } = getProjectStatusAndProgress(project);

  return (
    <Card hover onClick={() => onView(project._id)}>
      <CardHeader>
        <CardTitle>{project.name}</CardTitle>
        <StatusBadge status={status} statusStyles={statusStyles} />
      </CardHeader>

      <ProgressBar progress={progress} className="mb-4" />

      <div className="text-xs text-green-700 mb-4">
        Deadline:{" "}
        {project.deadline
          ? new Date(project.deadline).toLocaleDateString()
          : "N/A"}
      </div>

      <AvatarGroup members={project.team || []} className="mb-4" />

      <CardActions>
        <Button
          size="sm"
          variant="secondary"
          onClick={(e) => {
            e.stopPropagation();
            onEdit(project._id);
          }}
          className="bg-green-100 text-green-800 hover:bg-green-200"
        >
          Edit
        </Button>
        <Button
          size="sm"
          variant="danger"
          onClick={(e) => {
            e.stopPropagation();
            onDelete(project._id);
          }}
          className="bg-red-100 text-rose-700 hover:bg-rose-200"
        >
          Delete
        </Button>
      </CardActions>
    </Card>
  );
}
