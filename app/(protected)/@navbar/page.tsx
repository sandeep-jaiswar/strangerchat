import LoginButton from "@/components/LoginButton/LoginButton"

const Navbar = () => {
  return (
    <header className="w-full flex items-center justify-between">
      <div className="text-2xl font-bold flex-1 uppercase">StrangerChat</div>
      <div>
        <LoginButton />
      </div>
    </header>
  )
}

export default Navbar
