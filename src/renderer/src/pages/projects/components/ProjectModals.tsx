import { Project } from '../../../App'
import GitHistoryModal from './GitHistoryModal'
import EditProjectModal from './EditProjectModal'
import ArchiveProjectModal from './ArchiveProjectModal'

interface ProjectModalsProps {
  historyProject: Project | null
  onCloseHistory: () => void
  onRollback: (projectPath: string, hash: string) => Promise<void>
  onStatusChange: (id: string) => void

  editProject: Project | null
  onCloseEdit: () => void
  onSaveEdit: (updates: Partial<Project>) => Promise<void>
  saving: boolean

  archiveProject: Project | null
  onCloseArchive: () => void
  onArchive: (id: string) => Promise<void>
}

export default function ProjectModals({
  historyProject,
  onCloseHistory,
  onRollback,
  onStatusChange,
  editProject,
  onCloseEdit,
  onSaveEdit,
  saving,
  archiveProject,
  onCloseArchive,
  onArchive
}: ProjectModalsProps) {
  return (
    <>
      {historyProject && (
        <GitHistoryModal
          project={historyProject}
          isOpen
          onClose={onCloseHistory}
          onRollback={hash => onRollback(historyProject.path, hash)}
          onStatusChange={() => onStatusChange(historyProject.id)}
        />
      )}
      {editProject && (
        <EditProjectModal
          project={editProject}
          isOpen
          onClose={onCloseEdit}
          onSave={onSaveEdit}
          saving={saving}
        />
      )}
      {archiveProject && (
        <ArchiveProjectModal
          project={archiveProject}
          isOpen
          onClose={onCloseArchive}
          onArchive={() => onArchive(archiveProject.id)}
        />
      )}
    </>
  )
}
