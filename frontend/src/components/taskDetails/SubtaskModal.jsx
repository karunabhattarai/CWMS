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
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Attachments ({subtask.attachments.length})
            </label>
            <div className="space-y-2">
              {subtask.attachments.map((attachment, index) => (
                <div
                  key={index}
                  className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border hover:bg-gray-100 transition-colors"
                >
                  {/* Preview or Icon */}
                  <div className="flex-shrink-0">
                    {attachment.type === 'photo' && attachment.url.startsWith('data:') ? (
                      <img 
                        src={attachment.url} 
                        alt="Preview" 
                        className="w-10 h-10 object-cover rounded border cursor-pointer hover:scale-105 transition-transform"
                        onClick={() => window.open(attachment.url, '_blank')}
                        title="Click to view full size"
                      />
                    ) : (
                      <span className="text-xl">
                        {attachment.type === 'photo' ? '📷' : 
                         attachment.type === 'pdf' ? '📄' : '🔗'}
                      </span>
                    )}
                  </div>
                  
                  {/* File Info */}
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-gray-900 truncate">
                      {attachment.fileName || `${attachment.type.charAt(0).toUpperCase() + attachment.type.slice(1)} file`}
                    </div>
                    <div className="text-xs text-gray-500">
                      {attachment.url.startsWith('data:') ? (
                        <div className="flex items-center gap-2">
                          <span>Uploaded file</span>
                          {attachment.fileSize && (
                            <span className="text-gray-400">({(attachment.fileSize / 1024 / 1024).toFixed(1)} MB)</span>
                          )}
                        </div>
                      ) : (
                        <a
                          href={attachment.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-800 break-all"
                          title="Open in new tab"
                        >
                          {attachment.url.length > 50 ? 
                            `${attachment.url.substring(0, 50)}...` : 
                            attachment.url
                          }
                        </a>
                      )}
                    </div>
                  </div>
                  
                  {/* Action Buttons */}
                  <div className="flex items-center gap-1 flex-shrink-0">
                    {/* View/Open Button */}
                    <button
                      onClick={() => window.open(attachment.url, '_blank')}
                      className="text-blue-600 hover:text-blue-800 p-1.5 rounded hover:bg-blue-50 transition-colors"
                      title={attachment.type === 'link' ? 'Open link' : 'View file'}
                    >
                      {attachment.type === 'link' ? '🔗' : 'view'}
                    </button>

                    {/* Download Button */}
                    <button
                      onClick={() => {
                        if (attachment.url.startsWith('data:')) {
                          const link = document.createElement('a');
                          link.href = attachment.url;
                          link.download = attachment.fileName || `attachment.${attachment.type === 'photo' ? 'jpg' : 'pdf'}`;
                          document.body.appendChild(link);
                          link.click();
                          document.body.removeChild(link);
                        } else {
                          window.open(attachment.url, '_blank');
                        }
                      }}
                      className="text-green-600 hover:text-green-800 p-1.5 rounded hover:bg-green-50 transition-colors"
                      title="Download"
                    >
                      ⬇️
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
