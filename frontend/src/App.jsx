import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { CartProvider } from './contexts/CartContext';
import { AuthProvider } from './contexts/AuthContext';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { CartDrawer } from './components/CartDrawer';
import { ProtectedRoute } from './components/admin/ProtectedRoute';
import { UserProtectedRoute } from './components/UserProtectedRoute';

// ── Customer Pages (lazy loaded) ─────────────────────────────
const HomePage = lazy(() => import('./pages/HomePage').then(m => ({ default: m.HomePage })));
const ProductListPage = lazy(() => import('./pages/ProductListPage').then(m => ({ default: m.ProductListPage })));
const ProductDetailPage = lazy(() => import('./pages/ProductDetailPage').then(m => ({ default: m.ProductDetailPage })));
const CheckoutPage = lazy(() => import('./pages/CheckoutPage').then(m => ({ default: m.CheckoutPage })));
const OrderSuccessPage = lazy(() => import('./pages/OrderSuccessPage').then(m => ({ default: m.OrderSuccessPage })));
const AuthPage = lazy(() => import('./pages/AuthPage').then(m => ({ default: m.AuthPage })));
const ProfilePage = lazy(() => import('./pages/ProfilePage').then(m => ({ default: m.ProfilePage })));
const CartPage = lazy(() => import('./pages/CartPage').then(m => ({ default: m.CartPage })));

// ── Admin Pages (lazy loaded – separate chunk) ────────────────
const AdminLogin = lazy(() => import('./pages/admin/AdminLogin').then(m => ({ default: m.AdminLogin })));
const AdminDashboard = lazy(() => import('./pages/admin/AdminDashboard').then(m => ({ default: m.AdminDashboard })));
const ProductManagement = lazy(() => import('./pages/admin/ProductManagement').then(m => ({ default: m.ProductManagement })));
const OrderManagement = lazy(() => import('./pages/admin/OrderManagement').then(m => ({ default: m.OrderManagement })));

// ── Page fallback skeleton ───────────────────────────────────
const PageLoader = () => (
    <div className="min-h-screen flex items-center justify-center bg-[#fafafa]">
        <div className="flex flex-col items-center gap-4">
            <div className="w-12 h-12 rounded-full border-4 border-slate-200 border-t-primary-600 animate-spin" />
            <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Loading…</p>
        </div>
    </div>
);

function App() {
    return (
        <BrowserRouter>
            <AuthProvider>
                <CartProvider>
                    <Toaster
                        position="bottom-left"
                        toastOptions={{
                            duration: 4000,
                            style: {
                                background: 'rgba(15, 23, 42, 0.9)',
                                color: '#fff',
                                backdropFilter: 'blur(12px)',
                                borderRadius: '1.5rem',
                                padding: '1rem 1.5rem',
                                border: '1px solid rgba(255, 255, 255, 0.1)',
                                fontSize: '0.875rem',
                                fontWeight: '600',
                                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
                            },
                        }}
                    />

                    <Routes>
                        {/* Admin Routes – must come BEFORE customer routes */}
                        <Route
                            path="/portal-secure-mgt/login"
                            element={
                                <Suspense fallback={<PageLoader />}>
                                    <AdminLogin />
                                </Suspense>
                            }
                        />
                        <Route
                            path="/portal-secure-mgt/dashboard"
                            element={
                                <ProtectedRoute>
                                    <Suspense fallback={<PageLoader />}>
                                        <AdminDashboard />
                                    </Suspense>
                                </ProtectedRoute>
                            }
                        />
                        <Route
                            path="/portal-secure-mgt/products"
                            element={
                                <ProtectedRoute>
                                    <Suspense fallback={<PageLoader />}>
                                        <ProductManagement />
                                    </Suspense>
                                </ProtectedRoute>
                            }
                        />
                        <Route
                            path="/portal-secure-mgt/orders"
                            element={
                                <ProtectedRoute>
                                    <Suspense fallback={<PageLoader />}>
                                        <OrderManagement />
                                    </Suspense>
                                </ProtectedRoute>
                            }
                        />
                        <Route path="/portal-secure-mgt" element={<Navigate to="/portal-secure-mgt/dashboard" replace />} />

                        {/* Customer Routes */}
                        <Route
                            path="/*"
                            element={
                                <>
                                    <Navbar />
                                    <CartDrawer />
                                    <div className="flex flex-col min-h-screen">
                                        <div className="flex-grow">
                                            <Suspense fallback={<PageLoader />}>
                                                <Routes>
                                                    <Route path="/" element={<HomePage />} />
                                                    <Route path="/products" element={<ProductListPage />} />
                                                    <Route path="/products/:id" element={<ProductDetailPage />} />
                                                    <Route path="/cart" element={<CartPage />} />
                                                    <Route path="/checkout" element={<CheckoutPage />} />
                                                    <Route path="/order-success/:orderId" element={<OrderSuccessPage />} />
                                                    <Route path="/login" element={<AuthPage />} />
                                                    <Route
                                                        path="/profile"
                                                        element={
                                                            <UserProtectedRoute>
                                                                <ProfilePage />
                                                            </UserProtectedRoute>
                                                        }
                                                    />
                                                    <Route path="*" element={<Navigate to="/" replace />} />
                                                </Routes>
                                            </Suspense>
                                        </div>
                                        <Footer />
                                    </div>
                                </>
                            }
                        />
                    </Routes>
                </CartProvider>
            </AuthProvider>
        </BrowserRouter>
    );
}

export default App;
