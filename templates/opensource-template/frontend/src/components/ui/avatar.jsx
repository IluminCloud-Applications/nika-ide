import * as React from "react"

const Avatar = React.forwardRef(({ className = "", ...props }, ref) => (
  <div
    ref={ref}
    className={`relative flex h-10 w-10 shrink-0 overflow-hidden rounded-full ${className}`}
    {...props}
  />
))
Avatar.displayName = "Avatar"

const AvatarImage = React.forwardRef(({ className = "", onLoadingStatusChange, ...props }, ref) => {
  const [status, setStatus] = React.useState("loading")

  const handleLoad = () => {
    setStatus("loaded")
    onLoadingStatusChange?.("loaded")
  }

  const handleError = () => {
    setStatus("error")
    onLoadingStatusChange?.("error")
  }

  if (status === "error") return null

  return (
    <img
      ref={ref}
      className={`aspect-square h-full w-full object-cover ${className}`}
      onLoad={handleLoad}
      onError={handleError}
      {...props}
    />
  )
})
AvatarImage.displayName = "AvatarImage"

const AvatarFallback = React.forwardRef(({ className = "", ...props }, ref) => (
  <div
    ref={ref}
    className={`flex h-full w-full items-center justify-center rounded-full bg-muted ${className}`}
    {...props}
  />
))
AvatarFallback.displayName = "AvatarFallback"

export { Avatar, AvatarImage, AvatarFallback }
