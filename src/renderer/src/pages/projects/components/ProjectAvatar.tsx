import { useState, useEffect } from 'react'
import { Project } from '../../../App'

interface ProjectAvatarProps {
  project: Project
  size?: number
}

export default function ProjectAvatar({ project, size = 32 }: ProjectAvatarProps) {
  const [imgSrc, setImgSrc] = useState<string | null>(null)

  useEffect(() => {
    if (!project.imagePath) { setImgSrc(null); return }
    window.api.fs.readImage(project.imagePath)
      .then(src => setImgSrc(src))
      .catch(() => setImgSrc(null))
  }, [project.imagePath])

  const style = { width: size, height: size }

  return (
    <div
      className="relative rounded-lg overflow-hidden flex items-center justify-center shrink-0"
      style={style}
    >
      {imgSrc ? (
        <img src={imgSrc} alt={project.name} className="w-full h-full object-cover" />
      ) : (
        <div
          className="w-full h-full flex items-center justify-center"
          style={{ backgroundColor: project.color + '22' }}
        >
          <span className="text-sm font-bold" style={{ color: project.color }}>
            {project.name.charAt(0).toUpperCase()}
          </span>
        </div>
      )}
      <div className="absolute left-0 top-0 w-1 h-full" style={{ backgroundColor: project.color }} />
    </div>
  )
}
