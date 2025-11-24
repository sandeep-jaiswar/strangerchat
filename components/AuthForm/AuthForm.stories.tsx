import React from "react"
import { AuthForm } from "./AuthForm"

export default { title: "AuthForm" }

export const Login = () => <AuthForm type="login" onSubmit={(data) => alert(JSON.stringify(data))} />

export const Register = () => <AuthForm type="register" onSubmit={(data) => alert(JSON.stringify(data))} />
