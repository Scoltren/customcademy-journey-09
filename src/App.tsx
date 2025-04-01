
import { Routes, Route } from "react-router-dom";
import { Toaster } from "./components/ui/sonner";
import ResponsiveNavbar from "./components/ResponsiveNavbar";
import { Footer } from "./components/Footer";
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

function App() {
  return (
    <div className="flex flex-col min-h-screen">
      <ResponsiveNavbar />
      <main className="flex-grow">
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/courses" element={<Courses />} />
          <Route path="/course/:id" element={<CourseDetail />} />
          <Route path="/dashboard/*" element={<Dashboard />} />
          <Route path="/payment/success" element={<PaymentSuccess />} />
          <Route path="/confirm-email" element={<ConfirmEmail />} />
          <Route path="/create-course" element={<CreateCourse />} />
          <Route path="/select-interests" element={<SelectInterests />} />
          <Route path="/quiz/:category" element={<CategoryQuiz />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
      <Footer />
      <Toaster />
    </div>
  );
}

export default App;
