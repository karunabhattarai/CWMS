export default function SubtaskModal({ subtask, onClose }) {
  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 bg-black/40">
      <div className="bg-white rounded p-6 shadow-lg w-full max-w-lg relative">
        <button
          onClick={onClose}
          className="absolute top-2 right-2 text-gray-400 hover:text-gray-700 text-2xl"
        >
          &times;
        </button>
        <h2 className="text-xl font-bold mb-2">{subtask.name}</h2>
        <div className="mb-2">
          Description:{" "}
          <span className="text-gray-700">{subtask.comment || "—"}</span>
        </div>
        <div className="mb-2">
          Assigned to:{" "}
          <span className="text-green-700">
            {subtask.assignedMember?.name || "Unassigned"}
          </span>
        </div>
        <div className="mb-2">
          Status: <span className="font-medium">{subtask.status}</span>
        </div>
        <div className="mb-2">
          Deadline:{" "}
          <span>
            {subtask.earliestFinish
              ? new Date(subtask.earliestFinish).toLocaleDateString()
              : subtask.latestFinish
              ? new Date(subtask.latestFinish).toLocaleDateString()
              : "—"}
          </span>
        </div>
        <div className="mb-2">
          Duration:{" "}
          <span>
            {subtask.estimatedDurationDays
              ? `${subtask.estimatedDurationDays} day${
                  subtask.estimatedDurationDays !== 1 ? "s" : ""
                }`
              : "—"}
          </span>
        </div>
        {subtask.startedAt && (
          <div className="mb-2">
            Started At:{" "}
            <span>{new Date(subtask.startedAt).toLocaleDateString()}</span>
          </div>
        )}
        {subtask.completedAt && (
          <div className="mb-2">
            Completed At:{" "}
            <span>{new Date(subtask.completedAt).toLocaleDateString()}</span>
          </div>
        )}
        {subtask.attachments?.length > 0 && (
          <div className="mb-2">
            Attachments:
            <ul className="list-disc pl-5 text-sm">
              {subtask.attachments.map((att, idx) => (
                <li key={idx}>
                  <span>{att.type}:</span>{" "}
                  <a
                    href={att.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 underline"
                  >
                    {att.url}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
