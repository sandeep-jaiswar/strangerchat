import LoginButton from "@/components/LoginButton/LoginButton"

const Navbar = () => {
  return (
    <header className="flex w-full items-center justify-between">
      <div className="flex-1 text-2xl font-bold uppercase">StrangerChat</div>
      <div>
        <LoginButton />
      </div>
    </header>
  )
}

export default Navbar
