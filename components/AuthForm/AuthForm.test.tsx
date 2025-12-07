import { render, screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import React from "react"
import { beforeEach, describe, expect, it, vi } from "vitest"
import { AuthForm } from "./AuthForm"

describe("AuthForm component", () => {
  const mockOnSubmit = vi.fn()
  const mockOnForgotPassword = vi.fn()
  const mockOnSwitchMode = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe("Rendering - Login Form", () => {
    it("renders login form with correct title and description", () => {
      render(<AuthForm type="login" onSubmit={mockOnSubmit} />)
      expect(screen.getByText("Welcome back")).toBeInTheDocument()
      expect(screen.getByText("Sign in to your account")).toBeInTheDocument()
    })

    it("renders email and password fields for login", () => {
      render(<AuthForm type="login" onSubmit={mockOnSubmit} />)
      expect(screen.getByLabelText(/email/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/^password(?:\s*\*)?$/i)).toBeInTheDocument()
    })

    it("does not render name field for login", () => {
      render(<AuthForm type="login" onSubmit={mockOnSubmit} />)
      expect(screen.queryByLabelText(/full name/i)).not.toBeInTheDocument()
    })

    it("does not render confirm password field for login", () => {
      render(<AuthForm type="login" onSubmit={mockOnSubmit} />)
      expect(screen.queryByLabelText(/confirm password/i)).not.toBeInTheDocument()
    })

    it("renders submit button with correct text for login", () => {
      render(<AuthForm type="login" onSubmit={mockOnSubmit} />)
      expect(screen.getByRole("button", { name: /sign in/i })).toBeInTheDocument()
    })
  })

  describe("Rendering - Register Form", () => {
    it("renders register form with correct title and description", () => {
      render(<AuthForm type="register" onSubmit={mockOnSubmit} />)
      expect(screen.getByText("Create your account")).toBeInTheDocument()
      expect(screen.getByText("Sign up to get started")).toBeInTheDocument()
    })

    it("renders all fields for register form", () => {
      render(<AuthForm type="register" onSubmit={mockOnSubmit} />)
      expect(screen.getByLabelText(/full name/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/email/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/^password(?:\s*\*)?$/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/confirm password/i)).toBeInTheDocument()
    })

    it("renders submit button with correct text for register", () => {
      render(<AuthForm type="register" onSubmit={mockOnSubmit} />)
      expect(screen.getByRole("button", { name: /create account/i })).toBeInTheDocument()
    })

    it("shows password helper text for register", () => {
      render(<AuthForm type="register" onSubmit={mockOnSubmit} />)
      expect(screen.getByText("Must be at least 8 characters")).toBeInTheDocument()
    })
  })

  describe("Social Login", () => {
    it("renders social login buttons by default", () => {
      render(<AuthForm type="login" onSubmit={mockOnSubmit} />)
      expect(screen.getByText(/continue with google/i)).toBeInTheDocument()
      expect(screen.getByText(/continue with github/i)).toBeInTheDocument()
      expect(screen.getByText(/or continue with email/i)).toBeInTheDocument()
    })

    it("does not render social login when showSocialLogin is false", () => {
      render(<AuthForm type="login" onSubmit={mockOnSubmit} showSocialLogin={false} />)
      expect(screen.queryByText(/continue with google/i)).not.toBeInTheDocument()
      expect(screen.queryByText(/continue with github/i)).not.toBeInTheDocument()
    })

    it("logs to console when Google button is clicked", async () => {
      const consoleLogSpy = vi.spyOn(console, "log").mockImplementation(() => {})
      const user = userEvent.setup()
      render(<AuthForm type="login" onSubmit={mockOnSubmit} />)

      const googleButton = screen.getByText(/continue with google/i)
      await user.click(googleButton)

      expect(consoleLogSpy).toHaveBeenCalledWith("Social login with google")
      consoleLogSpy.mockRestore()
    })

    it("logs to console when GitHub button is clicked", async () => {
      const consoleLogSpy = vi.spyOn(console, "log").mockImplementation(() => {})
      const user = userEvent.setup()
      render(<AuthForm type="login" onSubmit={mockOnSubmit} />)

      const githubButton = screen.getByText(/continue with github/i)
      await user.click(githubButton)

      expect(consoleLogSpy).toHaveBeenCalledWith("Social login with github")
      consoleLogSpy.mockRestore()
    })
  })

  describe("Form Validation - Login", () => {
    it("shows error when email is invalid", async () => {
      const user = userEvent.setup()
      render(<AuthForm type="login" onSubmit={mockOnSubmit} />)

      const emailInput = screen.getByLabelText(/email/i)
      await user.type(emailInput, "invalid-email")

      const submitButton = screen.getByRole("button", { name: /sign in/i })
      await user.click(submitButton)

      expect(await screen.findByText("Please enter a valid email")).toBeInTheDocument()
      expect(mockOnSubmit).not.toHaveBeenCalled()
    })

    it("shows error when password is empty on submit", async () => {
      const user = userEvent.setup()
      render(<AuthForm type="login" onSubmit={mockOnSubmit} />)

      const emailInput = screen.getByLabelText(/email/i)
      await user.type(emailInput, "test@example.com")

      const submitButton = screen.getByRole("button", { name: /sign in/i })
      await user.click(submitButton)

      expect(await screen.findByText("Password is required")).toBeInTheDocument()
      expect(mockOnSubmit).not.toHaveBeenCalled()
    })

    it("submits valid login form", async () => {
      const user = userEvent.setup()
      render(<AuthForm type="login" onSubmit={mockOnSubmit} />)

      const emailInput = screen.getByLabelText(/email/i)
      const passwordInput = screen.getByLabelText(/password/i)

      await user.type(emailInput, "test@example.com")
      await user.type(passwordInput, "password123")

      const submitButton = screen.getByRole("button", { name: /sign in/i })
      await user.click(submitButton)

      await waitFor(() => {
        expect(mockOnSubmit).toHaveBeenCalledWith({
          email: "test@example.com",
          password: "password123",
          confirmPassword: "",
          name: "",
        })
      })
    })
  })

  describe("Form Validation - Register", () => {
    it("shows error when name is empty on submit", async () => {
      const user = userEvent.setup()
      render(<AuthForm type="register" onSubmit={mockOnSubmit} />)

      const submitButton = screen.getByRole("button", { name: /create account/i })
      await user.click(submitButton)

      expect(await screen.findByText("Name is required")).toBeInTheDocument()
      expect(mockOnSubmit).not.toHaveBeenCalled()
    })

    it("shows error when password is less than 8 characters for register", async () => {
      const user = userEvent.setup()
      render(<AuthForm type="register" onSubmit={mockOnSubmit} />)

      const nameInput = screen.getByLabelText(/full name/i)
      const emailInput = screen.getByLabelText(/email/i)
      const passwordInput = screen.getByLabelText(/password/i)

      await user.type(nameInput, "John Doe")
      await user.type(emailInput, "test@example.com")
      await user.type(passwordInput, "short")

      const submitButton = screen.getByRole("button", { name: /create account/i })
      await user.click(submitButton)

      expect(await screen.findByText("Password must be at least 8 characters")).toBeInTheDocument()
      expect(mockOnSubmit).not.toHaveBeenCalled()
    })

    it("shows error when confirm password is empty", async () => {
      const user = userEvent.setup()
      render(<AuthForm type="register" onSubmit={mockOnSubmit} />)

      const nameInput = screen.getByLabelText(/full name/i)
      const emailInput = screen.getByLabelText(/email/i)
      const passwordInput = screen.getByLabelText(/password/i)

      await user.type(nameInput, "John Doe")
      await user.type(emailInput, "test@example.com")
      await user.type(passwordInput, "password123")

      const submitButton = screen.getByRole("button", { name: /create account/i })
      await user.click(submitButton)

      expect(await screen.findByText("Please confirm your password")).toBeInTheDocument()
      expect(mockOnSubmit).not.toHaveBeenCalled()
    })

    it("shows error when passwords do not match", async () => {
      const user = userEvent.setup()
      render(<AuthForm type="register" onSubmit={mockOnSubmit} />)

      const nameInput = screen.getByLabelText(/full name/i)
      const emailInput = screen.getByLabelText(/email/i)
      const passwordInput = screen.getByLabelText(/password/i)
      const confirmPasswordInput = screen.getByLabelText(/confirm password/i)

      await user.type(nameInput, "John Doe")
      await user.type(emailInput, "test@example.com")
      await user.type(passwordInput, "password123")
      await user.type(confirmPasswordInput, "different")

      const submitButton = screen.getByRole("button", { name: /create account/i })
      await user.click(submitButton)

      expect(await screen.findByText("Passwords do not match")).toBeInTheDocument()
      expect(mockOnSubmit).not.toHaveBeenCalled()
    })

    it("submits valid register form", async () => {
      const user = userEvent.setup()
      render(<AuthForm type="register" onSubmit={mockOnSubmit} />)

      const nameInput = screen.getByLabelText(/full name/i)
      const emailInput = screen.getByLabelText(/email/i)
      const passwordInput = screen.getByLabelText(/password/i)
      const confirmPasswordInput = screen.getByLabelText(/confirm password/i)

      await user.type(nameInput, "John Doe")
      await user.type(emailInput, "test@example.com")
      await user.type(passwordInput, "password123")
      await user.type(confirmPasswordInput, "password123")

      const submitButton = screen.getByRole("button", { name: /create account/i })
      await user.click(submitButton)

      await waitFor(() => {
        expect(mockOnSubmit).toHaveBeenCalledWith({
          name: "John Doe",
          email: "test@example.com",
          password: "password123",
          confirmPassword: "password123",
        })
      })
    })

    it("validates name with only whitespace", async () => {
      const user = userEvent.setup()
      render(<AuthForm type="register" onSubmit={mockOnSubmit} />)

      const nameInput = screen.getByLabelText(/full name/i)
      await user.type(nameInput, "   ")

      const submitButton = screen.getByRole("button", { name: /create account/i })
      await user.click(submitButton)

      expect(await screen.findByText("Name is required")).toBeInTheDocument()
      expect(mockOnSubmit).not.toHaveBeenCalled()
    })

    it("validates email with only whitespace", async () => {
      const user = userEvent.setup()
      render(<AuthForm type="login" onSubmit={mockOnSubmit} />)

      const emailInput = screen.getByLabelText(/email/i)
      await user.type(emailInput, "   ")

      const submitButton = screen.getByRole("button", { name: /sign in/i })
      await user.click(submitButton)

      expect(await screen.findByText("Email is required")).toBeInTheDocument()
      expect(mockOnSubmit).not.toHaveBeenCalled()
    })
  })

  describe("Validation Error Clearing", () => {
    it("clears validation error when user types in field", async () => {
      const user = userEvent.setup()
      render(<AuthForm type="login" onSubmit={mockOnSubmit} />)

      const submitButton = screen.getByRole("button", { name: /sign in/i })
      await user.click(submitButton)

      expect(await screen.findByText("Email is required")).toBeInTheDocument()

      const emailInput = screen.getByLabelText(/email/i)
      await user.type(emailInput, "test@example.com")

      await waitFor(() => {
        expect(screen.queryByText("Email is required")).not.toBeInTheDocument()
      })
    })

    it("clears password error when user types", async () => {
      const user = userEvent.setup()
      render(<AuthForm type="login" onSubmit={mockOnSubmit} />)

      const emailInput = screen.getByLabelText(/email/i)
      await user.type(emailInput, "test@example.com")

      const submitButton = screen.getByRole("button", { name: /sign in/i })
      await user.click(submitButton)

      expect(await screen.findByText("Password is required")).toBeInTheDocument()

      const passwordInput = screen.getByLabelText(/password/i)
      await user.type(passwordInput, "p")

      await waitFor(() => {
        expect(screen.queryByText("Password is required")).not.toBeInTheDocument()
      })
    })
  })

  describe("Password Visibility Toggle", () => {
    it("toggles password visibility for password field", async () => {
      const user = userEvent.setup()
      render(<AuthForm type="login" onSubmit={mockOnSubmit} />)

      const passwordInput = screen.getByLabelText(/password/i) as HTMLInputElement
      expect(passwordInput.type).toBe("password")

      // Find the toggle button (eye icon button in password field)
      const passwordToggleButtons = screen.getAllByRole("button", { hidden: true })
      const passwordToggle = passwordToggleButtons.find((btn) => btn.getAttribute("tabIndex") === "-1")

      if (passwordToggle) {
        await user.click(passwordToggle)
        expect(passwordInput.type).toBe("text")

        await user.click(passwordToggle)
        expect(passwordInput.type).toBe("password")
      }
    })

    it("toggles confirm password visibility for register form", async () => {
      const user = userEvent.setup()
      render(<AuthForm type="register" onSubmit={mockOnSubmit} />)

      const confirmPasswordInput = screen.getByLabelText(/confirm password/i) as HTMLInputElement
      expect(confirmPasswordInput.type).toBe("password")

      // Find toggle buttons with tabIndex -1
      const toggleButtons = screen.getAllByRole("button", { hidden: true })
      const confirmPasswordToggle = toggleButtons.find(
        (btn) =>
          btn.getAttribute("tabIndex") === "-1" && btn.closest("[aria-labelledby]")?.textContent?.includes("Confirm")
      )

      if (confirmPasswordToggle) {
        await user.click(confirmPasswordToggle)
        expect(confirmPasswordInput.type).toBe("text")

        await user.click(confirmPasswordToggle)
        expect(confirmPasswordInput.type).toBe("password")
      }
    })
  })

  describe("Loading State", () => {
    it("disables all inputs when loading", () => {
      render(<AuthForm type="login" onSubmit={mockOnSubmit} loading={true} />)

      const emailInput = screen.getByLabelText(/email/i) as HTMLInputElement
      const passwordInput = screen.getByLabelText(/password/i) as HTMLInputElement

      expect(emailInput.disabled).toBe(true)
      expect(passwordInput.disabled).toBe(true)
    })

    it("shows loading state on submit button", () => {
      render(<AuthForm type="login" onSubmit={mockOnSubmit} loading={true} />)
      const submitButton = screen.getByRole("button", { name: /sign in/i })
      expect(submitButton).toHaveAttribute("aria-busy", "true")
    })

    it("disables all fields in register form when loading", () => {
      render(<AuthForm type="register" onSubmit={mockOnSubmit} loading={true} />)

      const nameInput = screen.getByLabelText(/full name/i) as HTMLInputElement
      const emailInput = screen.getByLabelText(/email/i) as HTMLInputElement
      const passwordInput = screen.getByLabelText(/password/i) as HTMLInputElement
      const confirmPasswordInput = screen.getByLabelText(/confirm password/i) as HTMLInputElement

      expect(nameInput.disabled).toBe(true)
      expect(emailInput.disabled).toBe(true)
      expect(passwordInput.disabled).toBe(true)
      expect(confirmPasswordInput.disabled).toBe(true)
    })
  })

  describe("Error Message Display", () => {
    it("displays error message when provided", () => {
      render(<AuthForm type="login" onSubmit={mockOnSubmit} error="Invalid credentials" />)
      expect(screen.getByText("Invalid credentials")).toBeInTheDocument()
      expect(screen.getByRole("alert")).toBeInTheDocument()
    })

    it("does not display error message when not provided", () => {
      render(<AuthForm type="login" onSubmit={mockOnSubmit} />)
      expect(screen.queryByRole("alert")).not.toBeInTheDocument()
    })
  })

  describe("Forgot Password", () => {
    it("renders forgot password link for login when callback provided", () => {
      render(<AuthForm type="login" onSubmit={mockOnSubmit} onForgotPassword={mockOnForgotPassword} />)
      expect(screen.getByText("Forgot password?")).toBeInTheDocument()
    })

    it("does not render forgot password link for register", () => {
      render(<AuthForm type="register" onSubmit={mockOnSubmit} onForgotPassword={mockOnForgotPassword} />)
      expect(screen.queryByText("Forgot password?")).not.toBeInTheDocument()
    })

    it("calls onForgotPassword when link is clicked", async () => {
      const user = userEvent.setup()
      render(<AuthForm type="login" onSubmit={mockOnSubmit} onForgotPassword={mockOnForgotPassword} />)

      const forgotPasswordLink = screen.getByText("Forgot password?")
      await user.click(forgotPasswordLink)

      expect(mockOnForgotPassword).toHaveBeenCalledTimes(1)
    })

    it("does not render forgot password link when callback not provided", () => {
      render(<AuthForm type="login" onSubmit={mockOnSubmit} />)
      expect(screen.queryByText("Forgot password?")).not.toBeInTheDocument()
    })
  })

  describe("Switch Mode", () => {
    it("renders switch mode section for login when callback provided", () => {
      render(<AuthForm type="login" onSubmit={mockOnSubmit} onSwitchMode={mockOnSwitchMode} />)
      expect(screen.getByText("Don't have an account?")).toBeInTheDocument()
      expect(screen.getByText("Sign up")).toBeInTheDocument()
    })

    it("renders switch mode section for register when callback provided", () => {
      render(<AuthForm type="register" onSubmit={mockOnSubmit} onSwitchMode={mockOnSwitchMode} />)
      expect(screen.getByText("Already have an account?")).toBeInTheDocument()
      expect(screen.getByText("Sign in")).toBeInTheDocument()
    })

    it("calls onSwitchMode when link is clicked from login", async () => {
      const user = userEvent.setup()
      render(<AuthForm type="login" onSubmit={mockOnSubmit} onSwitchMode={mockOnSwitchMode} />)

      const switchLink = screen.getByText("Sign up")
      await user.click(switchLink)

      expect(mockOnSwitchMode).toHaveBeenCalledTimes(1)
    })

    it("calls onSwitchMode when link is clicked from register", async () => {
      const user = userEvent.setup()
      render(<AuthForm type="register" onSubmit={mockOnSubmit} onSwitchMode={mockOnSwitchMode} />)

      const switchLink = screen.getByText("Sign in")
      await user.click(switchLink)

      expect(mockOnSwitchMode).toHaveBeenCalledTimes(1)
    })

    it("does not render switch mode section when callback not provided", () => {
      render(<AuthForm type="login" onSubmit={mockOnSubmit} />)
      expect(screen.queryByText("Don't have an account?")).not.toBeInTheDocument()
    })
  })

  describe("Custom className", () => {
    it("applies custom className to wrapper", () => {
      const { container } = render(<AuthForm type="login" onSubmit={mockOnSubmit} className="custom-class" />)
      expect(container.firstChild).toHaveClass("custom-class")
    })
  })

  describe("Form submission with preventDefault", () => {
    it("prevents default form submission", async () => {
      const _user = userEvent.setup()
      render(<AuthForm type="login" onSubmit={mockOnSubmit} />)

      const form = screen.getByRole("button", { name: /sign in/i }).closest("form")
      const submitEvent = new Event("submit", { bubbles: true, cancelable: true })
      const preventDefaultSpy = vi.spyOn(submitEvent, "preventDefault")

      form?.dispatchEvent(submitEvent)

      expect(preventDefaultSpy).toHaveBeenCalled()
    })
  })

  describe("Multiple validation errors", () => {
    it("shows all validation errors at once", async () => {
      const user = userEvent.setup()
      render(<AuthForm type="register" onSubmit={mockOnSubmit} />)

      const submitButton = screen.getByRole("button", { name: /create account/i })
      await user.click(submitButton)

      await waitFor(() => {
        expect(screen.getByText("Name is required")).toBeInTheDocument()
        expect(screen.getByText("Email is required")).toBeInTheDocument()
        expect(screen.getByText("Password is required")).toBeInTheDocument()
      })
    })
  })

  describe("Email validation edge cases", () => {
    it("accepts valid email formats", async () => {
      const validEmails = ["test@example.com", "user.name@domain.co.uk", "test+tag@example.com"]

      for (const email of validEmails) {
        const user = userEvent.setup()
        const { unmount } = render(<AuthForm type="login" onSubmit={mockOnSubmit} />)

        const emailInput = screen.getByLabelText(/email/i)
        const passwordInput = screen.getByLabelText(/password/i)

        await user.type(emailInput, email)
        await user.type(passwordInput, "password123")

        const submitButton = screen.getByRole("button", { name: /sign in/i })
        await user.click(submitButton)

        await waitFor(() => {
          expect(mockOnSubmit).toHaveBeenCalled()
        })

        mockOnSubmit.mockClear()
        unmount()
      }
    })

    it("rejects invalid email formats", async () => {
      const invalidEmails = ["notanemail", "@example.com", "test@", "test @example.com"]

      for (const email of invalidEmails) {
        const user = userEvent.setup()
        const { unmount } = render(<AuthForm type="login" onSubmit={mockOnSubmit} />)

        const emailInput = screen.getByLabelText(/email/i)
        await user.type(emailInput, email)

        const submitButton = screen.getByRole("button", { name: /sign in/i })
        await user.click(submitButton)

        await waitFor(() => {
          expect(screen.getByText("Please enter a valid email")).toBeInTheDocument()
        })

        expect(mockOnSubmit).not.toHaveBeenCalled()
        mockOnSubmit.mockClear()
        unmount()
      }
    })
  })

  describe("displayName", () => {
    it("has correct displayName", () => {
      expect(AuthForm.displayName).toBe("AuthForm")
    })
  })

  describe("Integration scenarios", () => {
    it("handles complete login flow with all interactions", async () => {
      const user = userEvent.setup()
      render(
        <AuthForm
          type="login"
          onSubmit={mockOnSubmit}
          onForgotPassword={mockOnForgotPassword}
          onSwitchMode={mockOnSwitchMode}
          showSocialLogin={true}
        />
      )

      // Try social login
      const googleButton = screen.getByText(/continue with google/i)
      await user.click(googleButton)

      // Fill form with invalid data first
      const emailInput = screen.getByLabelText(/email/i)
      await user.type(emailInput, "invalid")

      const submitButton = screen.getByRole("button", { name: /sign in/i })
      await user.click(submitButton)

      expect(await screen.findByText("Please enter a valid email")).toBeInTheDocument()

      // Clear and enter valid email
      await user.clear(emailInput)
      await user.type(emailInput, "valid@example.com")

      // Try submitting without password
      await user.click(submitButton)
      expect(await screen.findByText("Password is required")).toBeInTheDocument()

      // Enter password
      const passwordInput = screen.getByLabelText(/password/i)
      await user.type(passwordInput, "password123")

      // Submit valid form
      await user.click(submitButton)

      await waitFor(() => {
        expect(mockOnSubmit).toHaveBeenCalledWith({
          email: "valid@example.com",
          password: "password123",
          confirmPassword: "",
          name: "",
        })
      })
    })

    it("handles complete register flow with password visibility toggles", async () => {
      const user = userEvent.setup()
      render(<AuthForm type="register" onSubmit={mockOnSubmit} />)

      // Fill all fields
      const nameInput = screen.getByLabelText(/full name/i)
      const emailInput = screen.getByLabelText(/email/i)
      const passwordInput = screen.getByLabelText(/password/i) as HTMLInputElement
      const confirmPasswordInput = screen.getByLabelText(/confirm password/i) as HTMLInputElement

      await user.type(nameInput, "John Doe")
      await user.type(emailInput, "john@example.com")
      await user.type(passwordInput, "mypassword123")

      // Toggle password visibility
      const toggleButtons = screen.getAllByRole("button", { hidden: true })
      const passwordToggle = toggleButtons[0]
      await user.click(passwordToggle)
      expect(passwordInput.type).toBe("text")

      // Enter confirm password
      await user.type(confirmPasswordInput, "mypassword123")

      // Submit
      const submitButton = screen.getByRole("button", { name: /create account/i })
      await user.click(submitButton)

      await waitFor(() => {
        expect(mockOnSubmit).toHaveBeenCalledWith({
          name: "John Doe",
          email: "john@example.com",
          password: "mypassword123",
          confirmPassword: "mypassword123",
        })
      })
    })
  })
})
