import React, { useState } from "react"
import { cn } from "utils/cn"
import { Button } from "../Button"
import { Input } from "../Input"

type AuthFormProps = {
  type: "login" | "register"
  onSubmit: (data: { email: string; password: string }) => void
  error?: string
  className?: string
}

export const AuthForm: React.FC<AuthFormProps> = ({ type, onSubmit, error, className }) => {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  return (
    <form
      className={cn("space-y-4", className)}
      onSubmit={(e) => {
        e.preventDefault()
        onSubmit({ email, password })
      }}
    >
      <Input label="Email" value={email} onChange={(e) => setEmail(e.target.value)} type="email" />
      <Input label="Password" value={password} onChange={(e) => setPassword(e.target.value)} type="password" />
      {error && <div className="text-error text-sm">{error}</div>}
      <Button type="submit">{type === "login" ? "Login" : "Register"}</Button>
    </form>
  )
}
