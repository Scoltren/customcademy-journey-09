
import { Routes, Route } from "react-router-dom";
import { Toaster } from "./components/ui/sonner";
import Footer from "./components/Footer";
import Index from "./pages/Index";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Courses from "./pages/Courses";
import CourseDetail from "./pages/CourseDetail";
import Dashboard from "./pages/Dashboard";
import NotFound from "./pages/NotFound";
import "./App.css";
import PaymentSuccess from "./pages/PaymentSuccess";
import ConfirmEmail from "./pages/ConfirmEmail";
import CreateCourse from "./pages/CreateCourse";
import SelectInterests from "./pages/SelectInterests";
import CategoryQuiz from "./pages/CategoryQuiz";
import Navbar from "./components/Navbar";
import { AuthProvider } from "./contexts/AuthContext";

function App() {
  return (
    <AuthProvider>
      <div className="flex flex-col min-h-screen">
        <Routes>
          {/* Routes with Navbar and Footer */}
          <Route path="/" element={
            <>
              <Navbar />
              <main className="flex-grow pt-16">
                <Index />
              </main>
              <Footer />
            </>
          } />
          <Route path="/login" element={
            <>
              <Navbar />
              <main className="flex-grow pt-16">
                <Login />
              </main>
              <Footer />
            </>
          } />
          <Route path="/signup" element={
            <>
              <Navbar />
              <main className="flex-grow pt-16">
                <Signup />
              </main>
              <Footer />
            </>
          } />
          <Route path="/courses" element={
            <>
              <Navbar />
              <main className="flex-grow pt-16">
                <Courses />
              </main>
              <Footer />
            </>
          } />
          <Route path="/course/:id" element={
            <>
              <Navbar />
              <main className="flex-grow pt-16">
                <CourseDetail />
              </main>
              <Footer />
            </>
          } />
          <Route path="/dashboard/*" element={
            <>
              <Navbar />
              <main className="flex-grow pt-16">
                <Dashboard />
              </main>
              <Footer />
            </>
          } />
          <Route path="/payment/success" element={
            <>
              <Navbar />
              <main className="flex-grow pt-16">
                <PaymentSuccess />
              </main>
              <Footer />
            </>
          } />
          <Route path="/confirm-email" element={
            <>
              <Navbar />
              <main className="flex-grow pt-16">
                <ConfirmEmail />
              </main>
              <Footer />
            </>
          } />
          <Route path="/create-course" element={
            <>
              <Navbar />
              <main className="flex-grow pt-16">
                <CreateCourse />
              </main>
              <Footer />
            </>
          } />
          <Route path="/select-interests" element={
            <>
              <Navbar />
              <main className="flex-grow pt-16">
                <SelectInterests />
              </main>
              <Footer />
            </>
          } />
          
          {/* Routes without Navbar and Footer */}
          <Route path="/category-quiz" element={<CategoryQuiz />} />
          
          <Route path="*" element={
            <>
              <Navbar />
              <main className="flex-grow pt-16">
                <NotFound />
              </main>
              <Footer />
            </>
          } />
        </Routes>
        <Toaster />
      </div>
    </AuthProvider>
  );
}

export default App;
