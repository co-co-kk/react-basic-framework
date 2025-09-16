export default function Login() {
  return (
    <form className="flex flex-col gap-4">
      <h1 className="text-xl font-bold">🔐 Login</h1>
      <input type="text" placeholder="Username" className="border p-2 rounded" />
      <input type="password" placeholder="Password" className="border p-2 rounded" />
      <button className="bg-blue-500 text-white p-2 rounded hover:bg-blue-600">
        Login
      </button>
    </form>
  );
}
