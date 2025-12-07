import { fireEvent, render, screen, waitFor } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"
import { AuthForm } from "./AuthForm"

describe("AuthForm", () => {
  describe("Login Form", () => {
    it("renders login form with correct heading", () => {
      render(<AuthForm type="login" onSubmit={() => {}} />)
      expect(screen.getByText("Welcome back")).toBeInTheDocument()
      expect(screen.getByText("Sign in to your account")).toBeInTheDocument()
    })

    it("renders Sign In button", () => {
      render(<AuthForm type="login" onSubmit={() => {}} />)
      expect(screen.getByRole("button", { name: /sign in/i })).toBeInTheDocument()
    })

    it("shows social login buttons by default", () => {
      render(<AuthForm type="login" onSubmit={() => {}} />)
      expect(screen.getByText("Continue with Google")).toBeInTheDocument()
      expect(screen.getByText("Continue with GitHub")).toBeInTheDocument()
    })

    it("hides social login when showSocialLogin is false", () => {
      render(<AuthForm type="login" onSubmit={() => {}} showSocialLogin={false} />)
      expect(screen.queryByText("Continue with Google")).not.toBeInTheDocument()
      expect(screen.queryByText("Continue with GitHub")).not.toBeInTheDocument()
    })

    it("shows forgot password link when provided", () => {
      const onForgotPassword = vi.fn()
      render(<AuthForm type="login" onSubmit={() => {}} onForgotPassword={onForgotPassword} />)

      const forgotLink = screen.getByText("Forgot password?")
      expect(forgotLink).toBeInTheDocument()

      fireEvent.click(forgotLink)
      expect(onForgotPassword).toHaveBeenCalled()
    })

    it("does not show name field for login", () => {
      render(<AuthForm type="login" onSubmit={() => {}} />)
      expect(screen.queryByLabelText(/full name/i)).not.toBeInTheDocument()
    })
  })

  describe("Register Form", () => {
    it("renders register form with correct heading", () => {
      render(<AuthForm type="register" onSubmit={() => {}} />)
      expect(screen.getByText("Create your account")).toBeInTheDocument()
      expect(screen.getByText("Sign up to get started")).toBeInTheDocument()
    })

    it("renders Create Account button", () => {
      render(<AuthForm type="register" onSubmit={() => {}} />)
      expect(screen.getByRole("button", { name: /create account/i })).toBeInTheDocument()
    })

    it("shows name field for register", () => {
      render(<AuthForm type="register" onSubmit={() => {}} />)
      expect(screen.getByLabelText(/full name/i)).toBeInTheDocument()
    })

    it("shows confirm password field for register", () => {
      render(<AuthForm type="register" onSubmit={() => {}} />)
      expect(screen.getByLabelText(/confirm password/i)).toBeInTheDocument()
    })

    it("does not show forgot password link", () => {
      render(<AuthForm type="register" onSubmit={() => {}} onForgotPassword={() => {}} />)
      expect(screen.queryByText("Forgot password?")).not.toBeInTheDocument()
    })
  })

  describe("Form Validation", () => {
    it("shows validation error for empty email", async () => {
      const onSubmit = vi.fn()
      render(<AuthForm type="login" onSubmit={onSubmit} />)

      const submitButton = screen.getByRole("button", { name: /sign in/i })
      fireEvent.click(submitButton)

      await waitFor(() => {
        expect(screen.getByText("Email is required")).toBeInTheDocument()
      })
      expect(onSubmit).not.toHaveBeenCalled()
    })

    it("shows validation error for invalid email", async () => {
      const onSubmit = vi.fn()
      render(<AuthForm type="login" onSubmit={onSubmit} />)

      const emailInput = screen.getByLabelText(/^email/i)
      fireEvent.change(emailInput, { target: { value: "invalid-email" } })

      const submitButton = screen.getByRole("button", { name: /sign in/i })
      fireEvent.click(submitButton)

      await waitFor(() => {
        expect(screen.getByText("Please enter a valid email")).toBeInTheDocument()
      })
      expect(onSubmit).not.toHaveBeenCalled()
    })

    it("shows validation error for empty password", async () => {
      const onSubmit = vi.fn()
      render(<AuthForm type="login" onSubmit={onSubmit} />)

      const emailInput = screen.getByLabelText(/^email/i)
      fireEvent.change(emailInput, { target: { value: "test@example.com" } })

      const submitButton = screen.getByRole("button", { name: /sign in/i })
      fireEvent.click(submitButton)

      await waitFor(() => {
        expect(screen.getByText("Password is required")).toBeInTheDocument()
      })
      expect(onSubmit).not.toHaveBeenCalled()
    })

    it("validates password length for register", async () => {
      const onSubmit = vi.fn()
      render(<AuthForm type="register" onSubmit={onSubmit} />)

      const nameInput = screen.getByLabelText(/full name/i)
      const emailInput = screen.getByLabelText(/^email/i)
      const passwordInput = screen.getByLabelText(/^password/i)

      fireEvent.change(nameInput, { target: { value: "John Doe" } })
      fireEvent.change(emailInput, { target: { value: "test@example.com" } })
      fireEvent.change(passwordInput, { target: { value: "123" } })

      const submitButton = screen.getByRole("button", { name: /create account/i })
      fireEvent.click(submitButton)

      await waitFor(() => {
        expect(screen.getByText("Password must be at least 8 characters")).toBeInTheDocument()
      })
      expect(onSubmit).not.toHaveBeenCalled()
    })

    it("validates password match for register", async () => {
      const onSubmit = vi.fn()
      render(<AuthForm type="register" onSubmit={onSubmit} />)

      const nameInput = screen.getByLabelText(/full name/i)
      const emailInput = screen.getByLabelText(/^email/i)
      const passwordInput = screen.getByLabelText(/^password/i)
      const confirmPasswordInput = screen.getByLabelText(/confirm password/i)

      fireEvent.change(nameInput, { target: { value: "John Doe" } })
      fireEvent.change(emailInput, { target: { value: "test@example.com" } })
      fireEvent.change(passwordInput, { target: { value: "password123" } })
      fireEvent.change(confirmPasswordInput, { target: { value: "different" } })

      const submitButton = screen.getByRole("button", { name: /create account/i })
      fireEvent.click(submitButton)

      await waitFor(() => {
        expect(screen.getByText("Passwords do not match")).toBeInTheDocument()
      })
      expect(onSubmit).not.toHaveBeenCalled()
    })
  })

  describe("Form Submission", () => {
    it("calls onSubmit with valid login data", async () => {
      const onSubmit = vi.fn()
      render(<AuthForm type="login" onSubmit={onSubmit} />)

      const emailInput = screen.getByLabelText(/^email/i)
      const passwordInput = screen.getByLabelText(/^password/i)

      fireEvent.change(emailInput, { target: { value: "test@example.com" } })
      fireEvent.change(passwordInput, { target: { value: "password123" } })

      const submitButton = screen.getByRole("button", { name: /sign in/i })
      fireEvent.click(submitButton)

      await waitFor(() => {
        expect(onSubmit).toHaveBeenCalledWith({
          email: "test@example.com",
          password: "password123",
          confirmPassword: "",
          name: "",
        })
      })
    })

    it("calls onSubmit with valid register data", async () => {
      const onSubmit = vi.fn()
      render(<AuthForm type="register" onSubmit={onSubmit} />)

      const nameInput = screen.getByLabelText(/full name/i)
      const emailInput = screen.getByLabelText(/^email/i)
      const passwordInput = screen.getByLabelText(/^password/i)
      const confirmPasswordInput = screen.getByLabelText(/confirm password/i)

      fireEvent.change(nameInput, { target: { value: "John Doe" } })
      fireEvent.change(emailInput, { target: { value: "test@example.com" } })
      fireEvent.change(passwordInput, { target: { value: "password123" } })
      fireEvent.change(confirmPasswordInput, { target: { value: "password123" } })

      const submitButton = screen.getByRole("button", { name: /create account/i })
      fireEvent.click(submitButton)

      await waitFor(() => {
        expect(onSubmit).toHaveBeenCalledWith({
          email: "test@example.com",
          password: "password123",
          confirmPassword: "password123",
          name: "John Doe",
        })
      })
    })
  })

  describe("Error Display", () => {
    it("shows error message", () => {
      render(<AuthForm type="login" onSubmit={() => {}} error="Invalid credentials" />)
      expect(screen.getByText("Invalid credentials")).toBeInTheDocument()
    })
  })

  describe("Loading State", () => {
    it("shows loading state on button", () => {
      render(<AuthForm type="login" onSubmit={() => {}} loading />)
      const submitButton = screen.getByRole("button", { name: /sign in/i })
      expect(submitButton).toBeDisabled()
    })

    it("disables inputs when loading", () => {
      render(<AuthForm type="login" onSubmit={() => {}} loading />)
      const emailInput = screen.getByLabelText(/^email/i)
      const passwordInput = screen.getByLabelText(/^password/i)
      expect(emailInput).toBeDisabled()
      expect(passwordInput).toBeDisabled()
    })
  })

  describe("Mode Switching", () => {
    it("calls onSwitchMode when link is clicked", () => {
      const onSwitchMode = vi.fn()
      render(<AuthForm type="login" onSubmit={() => {}} onSwitchMode={onSwitchMode} />)

      const switchLink = screen.getByText("Sign up")
      fireEvent.click(switchLink)

      expect(onSwitchMode).toHaveBeenCalled()
    })
  })

  describe("Password Visibility Toggle", () => {
    it("toggles password visibility", () => {
      render(<AuthForm type="login" onSubmit={() => {}} />)
      const passwordInput = screen.getByLabelText(/^password/i) as HTMLInputElement

      expect(passwordInput.type).toBe("password")

      // Find and click the eye icon button (it's inside the Input component)
      const toggleButtons = screen.getAllByRole("button")
      const eyeButton = toggleButtons.find((btn) => btn.getAttribute("tabindex") === "-1")

      if (eyeButton) {
        fireEvent.click(eyeButton)
        expect(passwordInput.type).toBe("text")
      }
    })
  })
})
