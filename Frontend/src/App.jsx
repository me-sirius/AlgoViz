import { BrowserRouter, Route, Routes } from "react-router-dom";
import { lazy, Suspense } from "react";
import { Toaster } from "react-hot-toast";

// ============================================
// CRITICAL: Only import what's needed immediately
// Everything else uses lazy loading for code splitting
// ============================================

// Layout - Always needed (keep synchronous)
import MainLayout from "./layouts/MainLayout";
import LandingPage from "./pages/home"; // Modular composition (original archived at backup(old)/LandingPage.jsx)
import ErrorBoundary from "./components/ErrorBoundary";
import BugReportWidget from "./components/BugReportWidget";
import GlobalCommandPalette from "./components/GlobalCommandPalette";
import ProtectedRoute from "./components/ProtectedRoute";

// Loading fallback component
const PageLoader = () => (
  <div className="min-h-screen bg-[#0b0b0d] flex items-center justify-center">
    <div className="flex flex-col items-center gap-4">
      <div className="w-12 h-12 border-4 border-cyan-500/30 border-t-cyan-500 rounded-full animate-spin" />
      <p className="text-gray-400 text-sm">Loading...</p>
    </div>
  </div>
);

// ============================================
// LAZY LOADED COMPONENTS - Code split by route
// These only load when the user navigates to them
// ============================================

// Auth
const SignIn = lazy(() => import("./features/auth/SignIn"));
const SignUp = lazy(() => import("./features/auth/SignUp"));
const ResetPasswordPage = lazy(() => import("./features/auth/ResetPasswordPage"));

// Practice - Heavy components with Monaco Editor
const DSAPractice = lazy(() => import("./features/practice/DSAPractice"));
const MCQPracticePage = lazy(() => import("./features/practice/MCQPracticePage"));
const MockTestPage = lazy(() => import("./features/practice/MockTestPage"));
const IDEPage = lazy(() => import("./features/practice/BrutalistIDE"));
const IDEPlaygroundPage = lazy(() => import("./pages/ide"));
const ViewResultPage = lazy(() => import("./features/practice/ViewResultPage"));
const LeaderboardPage = lazy(() => import("./pages/leaderboard"));

// Interview
const InterviewExperiencePage = lazy(
  () => import("./features/interview/InterviewExperiencePage"),
);
const ExperienceDetailPage = lazy(
  () => import("./features/interview/ExperienceDetailPage"),
);
const ShareExperiencePage = lazy(
  () => import("./features/interview/ShareExperiencePage"),
);
const MockInterviewPage = lazy(() => import("./features/interview/MockInterviewPage"));
const MockInterviewBooking = lazy(
  () => import("./features/interview/MockInterviewBooking"),
);
const InterviewResultPage = lazy(
  () => import("./features/interview/InterviewResultPage"),
);

// Resources
const AlgorithmsPage = lazy(() => import("./features/resources/AlgorithmsPage"));
const BlogPage = lazy(() => import("./features/resources/BlogPage"));
const CheatSheet = lazy(() => import("./features/resources/CheatSheet"));
const BigOGuide = lazy(() => import("./features/resources/BigOGuide"));
const DocumentationModal = lazy(() => import("./features/resources/DocumentationModal"));

// Admin - Rarely accessed, definitely lazy load
const AdminDashboard = lazy(() => import("./features/admin/AdminDashboard"));
const MentorPortal = lazy(() => import("./features/mentor/MentorPortal"));

// User
const ContactPage = lazy(() => import("./features/user/ContactPage"));
const NotificationPage = lazy(() => import("./features/user/NotificationPage"));
const PremiumPage = lazy(() => import("./features/user/PremiumPage"));
const SupportPage = lazy(() => import("./features/user/SupportPage"));
const UserProfilePage = lazy(() => import("./features/user/UserProfilePage"));
const PublicProfilePage = lazy(() => import("./features/user/PublicProfilePage"));

// Pages (standalone routes)
const ComingSoonPage = lazy(() => import("./pages/coming-soon"));
const NotFoundPage = lazy(() => import("./pages/not-found"));
const AboutPage = lazy(() => import("./pages/about"));
const LegalPage = lazy(() => import("./pages/legal"));


// ============================================
// ALGORITHMS - Heavy visualization components
// These are the biggest offenders - each has canvas/animation logic
// ============================================

// Arrays and Sorting
const BubbleSort = lazy(
  () => import("./features/dsa/arrays-sorting/BubbleSort"),
);
const SelectionSort = lazy(
  () => import("./features/dsa/arrays-sorting/SelectionSort"),
);
const InsertionSort = lazy(
  () => import("./features/dsa/arrays-sorting/InsertionSort"),
);
const QuickSort = lazy(
  () => import("./features/dsa/arrays-sorting/QuickSort"),
);
const MergeSort = lazy(
  () => import("./features/dsa/arrays-sorting/MergeSort"),
);
const HeapSort = lazy(() => import("./features/dsa/arrays-sorting/HeapSort"));

// Search Algorithms
const BinarySearch = lazy(
  () => import("./features/dsa/search-algorithms/BinarySearch"),
);
const LinearSearch = lazy(
  () => import("./features/dsa/search-algorithms/LinearSearch"),
);
const ExponentialSearch = lazy(
  () => import("./features/dsa/search-algorithms/ExponentialSearch"),
);
const InterpolationSearch = lazy(
  () => import("./features/dsa/search-algorithms/InterpolationSearch"),
);
const JumpSearch = lazy(
  () => import("./features/dsa/search-algorithms/JumpSearch"),
);

// Trees and Graphs
const BFS = lazy(() => import("./features/dsa/trees-graphs/BFS"));
const DFS = lazy(() => import("./features/dsa/trees-graphs/DFS"));
const Dijkstra = lazy(() => import("./features/dsa/trees-graphs/Dijkstra"));
const AStar = lazy(() => import("./features/dsa/trees-graphs/AStar"));
const TopologicalSort = lazy(
  () => import("./features/dsa/trees-graphs/TopologicalSort"),
);
const TreeTraversal = lazy(
  () => import("./features/dsa/trees-graphs/TreeTraversal"),
);
const BST = lazy(() => import("./features/dsa/trees-graphs/BST"));
const AVLTree = lazy(() => import("./features/dsa/trees-graphs/AVLTree"));

// Dynamic Programming
const Fibonacci = lazy(
  () => import("./features/dsa/dynamic-programming/Fibonacci"),
);
const ClimbingStairs = lazy(
  () => import("./features/dsa/dynamic-programming/ClimbingStairs"),
);
const Knapsack = lazy(
  () => import("./features/dsa/dynamic-programming/Knapsack"),
);
const LCS = lazy(() => import("./features/dsa/dynamic-programming/LCS"));
const EditDistance = lazy(
  () => import("./features/dsa/dynamic-programming/EditDistance"),
);
const CoinChange = lazy(
  () => import("./features/dsa/dynamic-programming/CoinChange"),
);

// Greedy Algorithms
const ActivitySelection = lazy(
  () => import("./features/dsa/greedy-algorithms/ActivitySelection"),
);
const HuffmanCoding = lazy(
  () => import("./features/dsa/greedy-algorithms/HuffmanCoding"),
);
const PrimMST = lazy(() => import("./features/dsa/greedy-algorithms/PrimMST"));
const KruskalMST = lazy(
  () => import("./features/dsa/greedy-algorithms/KruskalMST"),
);
const UnionFind = lazy(
  () => import("./features/dsa/greedy-algorithms/UnionFind"),
);

// Backtracking
const NQueens = lazy(() => import("./features/dsa/backtracking/NQueens"));
const SudokuSolver = lazy(
  () => import("./features/dsa/backtracking/SudokuSolver"),
);
const MazeSolver = lazy(() => import("./features/dsa/backtracking/MazeSolver"));
const SubsetSum = lazy(() => import("./features/dsa/backtracking/SubsetSum"));
const WordSearch = lazy(() => import("./features/dsa/backtracking/WordSearch"));

function App() {
  return (
    <ErrorBoundary>
      <Suspense fallback={<PageLoader />}>
        <Routes>
          {/* Shared layout with landing navbar */}
          <Route path="/" element={<MainLayout />}>
            <Route index element={<LandingPage />} />
            <Route path="about" element={<AboutPage />} />
          </Route>
          {/* Routes without Navbar */}
          <Route path="/cheatsheet" element={<CheatSheet />} />
          <Route path="/support" element={<SupportPage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/legal/:section" element={<LegalPage />} />
          <Route path="/blogs" element={<BlogPage />} />
          <Route path="/signin" element={<SignIn />} />
          <Route path="/register" element={<SignUp />} />
          <Route
            path="/user-profile"
            element={
              <ProtectedRoute>
                <UserProfilePage />
              </ProtectedRoute>
            }
          />
          <Route path="/profile/:id" element={<PublicProfilePage />} />
          <Route path="/view-documentation" element={<DocumentationModal />} />
          <Route path="/ide" element={<IDEPlaygroundPage />} />
          <Route path="/bubble-sort" element={<BubbleSort />} />
          <Route path="/selection-sort" element={<SelectionSort />} />
          <Route path="/insertion-sort" element={<InsertionSort />} />
          <Route path="/quick-sort" element={<QuickSort />} />
          <Route path="/merge-sort" element={<MergeSort />} />
          <Route path="/heap-sort" element={<HeapSort />} />
          <Route path="/binary-search" element={<BinarySearch />} />
          <Route path="/linear-search" element={<LinearSearch />} />
          <Route path="/exponential-search" element={<ExponentialSearch />} />
          <Route
            path="/interpolation-search"
            element={<InterpolationSearch />}
          />
          <Route path="/jump-search" element={<JumpSearch />} />
          <Route path="/bfs-visualizer" element={<BFS />} />
          <Route path="/dfs-visualizer" element={<DFS />} />
          <Route path="/dijkstra-visualizer" element={<Dijkstra />} />
          <Route path="/astar-visualizer" element={<AStar />} />
          <Route path="/topological-sort" element={<TopologicalSort />} />
          <Route path="/tree-traversal" element={<TreeTraversal />} />
          <Route path="/bst" element={<BST />} />
          <Route path="/avl-tree" element={<AVLTree />} />
          <Route path="/fibonacci" element={<Fibonacci />} />
          <Route path="/climbing-stairs" element={<ClimbingStairs />} />
          <Route path="/knapsack" element={<Knapsack />} />
          <Route path="/lcs" element={<LCS />} />
          <Route path="/edit-distance" element={<EditDistance />} />
          <Route path="/coin-change" element={<CoinChange />} />
          <Route path="/algorithms" element={<AlgorithmsPage />} />
          <Route path="/big-o-guide" element={<BigOGuide />} />
          <Route path="/activity-selection" element={<ActivitySelection />} />
          <Route path="/huffman-coding" element={<HuffmanCoding />} />
          <Route path="/prim-mst" element={<PrimMST />} />
          <Route path="/kruskal-mst" element={<KruskalMST />} />
          <Route path="/union-find" element={<UnionFind />} />
          <Route path="/n-queens" element={<NQueens />} />
          <Route path="/sudoku-solver" element={<SudokuSolver />} />
          <Route path="/maze-solver" element={<MazeSolver />} />
          <Route path="/subset-sum" element={<SubsetSum />} />
          <Route path="/word-search" element={<WordSearch />} />
          <Route path="/coming-soon" element={<ComingSoonPage />} />
          <Route path="/leaderboard" element={<LeaderboardPage />} />
          <Route path="/page-not-found" element={<NotFoundPage />} />
          <Route path="*" element={<NotFoundPage />} />
          <Route
            path="/practice"
            element={
              <ProtectedRoute>
                <DSAPractice />
              </ProtectedRoute>
            }
          />
          <Route
            path="/solve/:id"
            element={
              <ProtectedRoute>
                <IDEPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/reset-password/:token"
            element={<ResetPasswordPage />}
          />
          <Route
            path="/Interview-Experience"
            element={
              <ProtectedRoute>
                <InterviewExperiencePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/Mock-Interview"
            element={
              <ProtectedRoute>
                <MockInterviewPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/premium"
            element={
              <ProtectedRoute>
                <PremiumPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/book-mock-interview/:id"
            element={
              <ProtectedRoute>
                <MockInterviewBooking />
              </ProtectedRoute>
            }
          />
          <Route
            path="/experience/:id"
            element={
              <ProtectedRoute>
                <ExperienceDetailPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/share-experience"
            element={
              <ProtectedRoute>
                <ShareExperiencePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/notification"
            element={
              <ProtectedRoute>
                <NotificationPage />
              </ProtectedRoute>
            }
          />
          <Route path="/admin-portal" element={<AdminDashboard />} />{" "}
          {/* Has its own auth */}
          <Route
            path="/mcq"
            element={
              <ProtectedRoute>
                <MCQPracticePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/viewResult/:id"
            element={
              <ProtectedRoute>
                <ViewResultPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/interview-result/:reviewId"
            element={
              <ProtectedRoute>
                <InterviewResultPage />
              </ProtectedRoute>
            }
          />

          <Route path="/mentor/portal" element={<MentorPortal />} />{" "}
          {/* Has its own auth */}
          <Route
            path="/mock-test"
            element={
              <ProtectedRoute>
                <MockTestPage />
              </ProtectedRoute>
            }
          />
        </Routes>
      </Suspense>
      <GlobalCommandPalette />
      <BugReportWidget />
      <Toaster position="bottom-right" reverseOrder={false} />
    </ErrorBoundary>
  );
}

export default App;
