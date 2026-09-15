// import { useState } from 'react';
// // We import the specific shadcn components we just downloaded
// import { Button } from "@/components/ui/button"
// import { Input } from "@/components/ui/input"
// import { Label } from "@/components/ui/label"
// import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"

// export default function App() {
//   const [email, setEmail] = useState<string>("");
//   const [password, setPassword] = useState<string>("");
//   const [errorMessage, setErrorMessage] = useState<string>("");

//   const handleLogin = (event: React.FormEvent<HTMLFormElement>) => {
//     event.preventDefault();
//     setErrorMessage("");

//     if (email === "" || password === "") {
//       setErrorMessage("Both fields are required.");
//       return;
//     }

//     if (password.length < 6) {
//       setErrorMessage("Password must be at least 6 characters.");
//       return;
//     }

//     alert(`Success! Logging in with: ${email}`);
//     setEmail("");
//     setPassword("");
//   };

//   return (
//     // Tailwind classes center the card vertically and horizontally on a gray background
//     <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
     
//       {/* The shadcn Card component handles all the borders, shadows, and rounded corners */}
//       <Card className="w-full max-w-md">
//         <CardHeader>
//           <CardTitle className="text-2xl font-bold">Welcome Back</CardTitle>
//           <CardDescription>Enter your email and password to log in.</CardDescription>
//         </CardHeader>
       
//         <form onSubmit={handleLogin}>
//           <CardContent className="grid gap-4">
           
//             {/* Error Message */}
//             {errorMessage && (
//               <div className="p-3 text-sm text-red-500 bg-red-50 rounded-md">
//                 {errorMessage}
//               </div>
//             )}

//             {/* Email Field */}
//             <div className="grid gap-2">
//               <Label htmlFor="email">Email</Label>
//               <Input
//                 id="email"
//                 type="email"
//                 placeholder="name@example.com"
//                 value={email}
//                 onChange={(e) => setEmail(e.target.value)}
//               />
//             </div>

//             {/* Password Field */}
//             <div className="grid gap-2">
//               <Label htmlFor="password">Password</Label>
//               <Input
//                 id="password"
//                 type="password"
//                 value={password}
//                 onChange={(e) => setPassword(e.target.value)}
//               />
//             </div>

//           </CardContent>
         
//           <CardFooter>
//             <Button className="w-full" type="submit">Log In</Button>
//           </CardFooter>
//         </form>
//       </Card>
     
//     </div>
//   );
// }



import { useState } from 'react'
export default function App ()
{
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [errorMessage, setErrorMesssage] = useState<string>("");

  const handleLogin = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    setErrorMesssage("");
    if(email === "" || password === "") {
      setErrorMesssage("Both fields are required.");
      return;
    }

    if(password.length<6){
      setErrorMesssage("password must be at least 6 characters.");
      return;
    }
    alert(`Success! Logging in with: ${email}`)
    setEmail("");
    setPassword("");

  };

  return(
    <div className='login-container' style={{ maxWidth: '400px', margin: '50px auto', fontFamily: 'sans-serif'}}>
      <h2>Welcome Back</h2>
      {errorMessage && (
        <p style = {{ color: 'red'}}>{errorMessage}</p>
      )}
      <form onSubmit={handleLogin}>
     <div style={{ marginBottom: '15px'}}>
      <label>Email:</label>
      <br />
      <input
      type="email"
      value={email}
      onChange={(e) => setEmail(e.target.value)}
      style={{ width: '100%', padding: '8px' }}
      />
     </div>
    <div style={{ marginBottom: '15px' }}>
      <label>Password:</label>
      <br />
      <input
      type="password"
      value={password}
      onChange={(e) => setPassword(e.target.value)}
      style={{ width: '100%', padding: '8px'}}
      />
      </div>
      <button type='submit' style={{width: '100%', padding: '10px', background: 'blue', color: 'white'}}>
        Log In
      </button>
      </form>
      </div>
  );
}
