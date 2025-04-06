   // Structure for Navbar.jsx
   import React from 'react';
   import { useChat } from "../hooks/useChat";
import { LogOut } from 'lucide-react';
   export const Navbar = ({logout}) => {
     const { need_data_for_ui } = useChat();
    //  console.log(user);
    //  const username=localStorage.getItem('user');
     return (
       <nav className="fixed top-0 left-0 right-0 z-20 bg-gray-900  shadow-md border-gray-700">
         <div className="max-w-7xl mx-auto px-2">
           <div className="flex justify-between items-center h-16">
             {/* Logo and title */}
             <div className="flex items-center">
               <img 
                 src={need_data_for_ui.companyLogo} 
                 alt="Company Logo" 
                 className="h-8 w-auto mr-3"
               />
               {/* <span className="font-bold text-lg text-gray-900">Virtual Assistant</span> */}
             </div>
             
             {/* Navigation links */}
             {/* <div className="hidden md:block">
               <div className="ml-10 flex items-center space-x-4">
                 <a href="#" className="px-3 py-2 rounded-md text-sm font-medium text-gray-900 hover:bg-blue-100">Home</a>
                 <a href="#" className="px-3 py-2 rounded-md text-sm font-medium text-gray-900 hover:bg-blue-100">Features</a>
                 <a href="#" className="px-3 py-2 rounded-md text-sm font-medium text-gray-900 hover:bg-blue-100">Help</a>
               </div>
             </div> */}
             
             {/* User profile */}
             {/* <div className="flex items-center">
               <div className="bg-blue-100 px-3 py-1 rounded-full text-sm">
                 <span className="font-medium">Hi {username|| "There"}</span>
               </div>
             </div> */}
             <div className="flex items-center">
               {/* <div className='bg-gray-800 text-white flex items-center' > */}
                <button onClick={logout}><LogOut style={{color:"white"}}/></button>
               {/* </div> */}
             </div>
           </div>
         </div>
       </nav>
     );
   };