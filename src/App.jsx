import { Loader } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import { Leva } from "leva";
import { Experience } from "./components/Experience";
import { UI } from "./components/UI";
import { useAuth } from "./hooks/useAuth";
import { useState } from "react";
import { Navbar } from "./components/Navbar";
const LoginForm = () => {
  const [employeeId, setEmployeeId] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  
  const { login } = useAuth();
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    try {
      const success = await login(employeeId, password);
      
      if (!success) {
        setError("Invalid credentials. Please try again.");
      }
    } catch (err) {
      setError("An error occurred during login. Please try again.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900">
      <div className="max-w-md w-full p-6 bg-gray-800 rounded-lg shadow-lg">
        <div className="flex justify-center mb-8">
          <img 
            src="https://poetsandquants.com/wp-content/uploads/sites/5/2014/07/Deloitte-logo.jpg" 
            alt="Deloitte Logo" 
            className="h-16" 
          />
        </div>
        <h2 className="text-2xl font-bold text-center text-white mb-4">
          Login to 3D Chat Assistant
        </h2>
        
        {error && (
          <div className="mb-4 p-3 bg-red-900 bg-opacity-50 text-red-200 rounded-md">
            {error}
          </div>
        )}
        
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-gray-300 text-sm font-bold mb-2" htmlFor="employeeId">
              Employee ID
            </label>
            <input
              id="employeeId"
              type="text"
              className="w-full px-3 py-2 border border-gray-600 bg-gray-700 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter your employee ID"
              value={employeeId}
              onChange={(e) => setEmployeeId(e.target.value)}
              required
            />
          </div>
          
          <div className="mb-6">
            <label className="block text-gray-300 text-sm font-bold mb-2" htmlFor="password">
              Password
            </label>
            <input
              id="password"
              type="password"
              className="w-full px-3 py-2 border border-gray-600 bg-gray-700 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          
          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
            disabled={loading}
          >
            {loading ? (
              <span className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Processing...
              </span>
            ) : "Sign In"}
          </button>
        </form>
      </div>
    </div>
  );
};

function App() {

  const { isAuthenticated, logout } = useAuth();
  // console.log(user);
  if (!isAuthenticated) {
    return <LoginForm />;
  }
  return (
    <>
      <Loader />
      <Leva hidden />
      {/* <div className="fixed top-4 right-4 z-50 flex" style={{display:"flex",alignItems:"center",justifyContent:"center",marginTop:"9px"}}>
        <div className="bg-white bg-opacity-80 p-2 rounded-md shadow-md mb-2 text-center" style={{height:"30px"}}>
          <span className="block text-sm font-medium text-gray-700">
            {user?.employeeId || "User"}
          </span>
        </div>
        <button 
          onClick={logout}
          className="bg-red-500 hover:bg-red-600 text-white py-2 px-4 rounded-md shadow-md w-full"
          style={{height:"30px", width:"90px", display:"flex",justifyContent:"center",alignItems:"center",flexDirection:"column"}}
        >
          Logout
        </button>
      </div> */}
      <Navbar logout={logout} />
      <UI />
      <Canvas shadows camera={{ position: [0, 0, 1], fov: 30 }}>
        <Experience />
      </Canvas>
    </>
  );
}

export default App;
