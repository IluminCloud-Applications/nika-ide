import * as React from "react"

const FormFieldContext = React.createContext({ name: "", error: "" })
const FormContext = React.createContext({ errors: {}, setError: () => {}, clearError: () => {} })

function useFormField() {
  const fieldContext = React.useContext(FormFieldContext)
  return fieldContext
}

function Form({ children, className = "", onSubmit, ...props }) {
  const [errors, setErrors] = React.useState({})

  const setError = React.useCallback((name, message) => {
    setErrors((prev) => ({ ...prev, [name]: message }))
  }, [])

  const clearError = React.useCallback((name) => {
    setErrors((prev) => {
      const next = { ...prev }
      delete next[name]
      return next
    })
  }, [])

  return (
    <FormContext.Provider value={{ errors, setError, clearError }}>
      <form className={className} onSubmit={onSubmit} {...props}>
        {children}
      </form>
    </FormContext.Provider>
  )
}

function FormField({ name, children }) {
  const { errors } = React.useContext(FormContext)
  const error = errors[name] || ""

  return (
    <FormFieldContext.Provider value={{ name, error }}>
      {children}
    </FormFieldContext.Provider>
  )
}

const FormItem = React.forwardRef(({ className = "", ...props }, ref) => (
  <div ref={ref} className={`space-y-2 ${className}`} {...props} />
))
FormItem.displayName = "FormItem"

const FormLabel = React.forwardRef(({ className = "", ...props }, ref) => {
  const { error } = React.useContext(FormFieldContext)

  return (
    <label
      ref={ref}
      className={`text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 ${
        error ? "text-destructive" : ""
      } ${className}`}
      {...props}
    />
  )
})
FormLabel.displayName = "FormLabel"

const FormControl = React.forwardRef(({ className = "", ...props }, ref) => {
  const { name, error } = React.useContext(FormFieldContext)

  return (
    <div
      ref={ref}
      className={className}
      aria-invalid={!!error}
      aria-describedby={error ? `${name}-message` : undefined}
      {...props}
    />
  )
})
FormControl.displayName = "FormControl"

const FormDescription = React.forwardRef(({ className = "", ...props }, ref) => (
  <p ref={ref} className={`text-[0.8rem] text-muted-foreground ${className}`} {...props} />
))
FormDescription.displayName = "FormDescription"

const FormMessage = React.forwardRef(({ className = "", children, ...props }, ref) => {
  const { name, error } = React.useContext(FormFieldContext)
  const message = error || children

  if (!message) return null

  return (
    <p
      ref={ref}
      id={`${name}-message`}
      className={`text-[0.8rem] font-medium text-destructive ${className}`}
      {...props}
    >
      {message}
    </p>
  )
})
FormMessage.displayName = "FormMessage"

export { Form, FormField, FormItem, FormLabel, FormControl, FormDescription, FormMessage, useFormField }
