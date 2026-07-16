// /app/payment-options/page.jsx

"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import { 
  CreditCard, Plus, Trash2, CheckCircle, 
  Shield, AlertCircle, Loader2, X,
  Wallet, Smartphone, Building, 
  Star, Lock, CreditCard as CardIcon,
  ChevronRight, Sparkles
} from "lucide-react";
import { Elements, CardElement, useStripe, useElements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";

const STRIPE_PUBLISHABLE_KEY = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;

const STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700;800&family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap');

  .pay-page {
    font-family: 'Plus Jakarta Sans', sans-serif;
    min-height: 100vh;
    background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 50%, #f0f9ff 100%);
  }
  .hph { font-family: 'Outfit', sans-serif; }

  .glass-card {
    background: rgba(255, 255, 255, 0.85);
    backdrop-filter: blur(12px);
    border-radius: 20px;
    border: 1px solid rgba(0, 188, 212, 0.15);
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.04);
    transition: all 0.3s ease;
  }
  .glass-card:hover {
    background: rgba(255, 255, 255, 0.95);
    border-color: rgba(0, 188, 212, 0.3);
    box-shadow: 0 8px 30px rgba(0, 188, 212, 0.08);
  }

  .method-card {
    background: white;
    border-radius: 16px;
    padding: 16px 20px;
    border: 1.5px solid #e2e8f0;
    transition: all 0.3s ease;
    cursor: pointer;
  }
  .method-card:hover {
    border-color: #00bcd4;
    transform: translateY(-2px);
    box-shadow: 0 8px 20px rgba(0, 188, 212, 0.08);
  }
  .method-card.default {
    border-color: #00bcd4;
    background: linear-gradient(135deg, #f0fdf4, #ecfdf5);
  }
  .method-card .icon-circle {
    width: 44px;
    height: 44px;
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
  }

  .form-input {
    width: 100%;
    padding: 12px 16px;
    border: 1.5px solid #e2e8f0;
    border-radius: 12px;
    font-size: 14px;
    transition: all 0.2s ease;
    outline: none;
    background: white;
  }
  .form-input:focus {
    border-color: #00bcd4;
    box-shadow: 0 0 0 3px rgba(0, 188, 212, 0.1);
  }

  .btn-primary {
    background: linear-gradient(135deg, #00bcd4, #0097a7);
    color: white;
    padding: 12px 24px;
    border-radius: 12px;
    font-weight: 600;
    font-size: 14px;
    border: none;
    cursor: pointer;
    transition: all 0.3s ease;
  }
  .btn-primary:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 20px rgba(0, 188, 212, 0.3);
  }
  .btn-primary:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
  }

  .btn-outline {
    background: transparent;
    color: #0097a7;
    padding: 12px 24px;
    border-radius: 12px;
    font-weight: 600;
    font-size: 14px;
    border: 1.5px solid #00bcd4;
    cursor: pointer;
    transition: all 0.3s ease;
  }
  .btn-outline:hover {
    background: rgba(0, 188, 212, 0.08);
    transform: translateY(-2px);
  }

  .stripe-element {
    padding: 12px 16px;
    border: 1.5px solid #e2e8f0;
    border-radius: 12px;
    background: white;
    transition: all 0.2s ease;
  }
  .stripe-element:focus-within {
    border-color: #00bcd4;
    box-shadow: 0 0 0 3px rgba(0, 188, 212, 0.1);
  }

  @keyframes fadeUp {
    from { opacity: 0; transform: translateY(20px); }
    to { opacity: 1; transform: translateY(0); }
  }
  .fade-up {
    animation: fadeUp 0.4s ease forwards;
  }

  .badge-premium {
    background: linear-gradient(135deg, #fbbf24, #f59e0b);
    color: #78350f;
    font-size: 10px;
    font-weight: 700;
    padding: 2px 10px;
    border-radius: 99px;
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }
`;

// ✅ Stripe Card Form Component
function StripeCardForm({ onSuccess, onError, loading, setLoading }) {
  const stripe = useStripe();
  const elements = useElements();
  const [cardComplete, setCardComplete] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!stripe || !elements || !cardComplete) return;

    setLoading(true);
    try {
      const { error, paymentMethod } = await stripe.createPaymentMethod({
        type: 'card',
        card: elements.getElement(CardElement),
      });

      if (error) {
        onError(error.message);
        return;
      }

      // Save payment method to backend
      const res = await fetch("/api/user/payment-methods", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({
          paymentMethodId: paymentMethod.id,
          nameOnAccount: "",
        }),
      });

      const data = await res.json();
      if (data.success) {
        onSuccess(data.methods);
      } else {
        onError(data.message || "Failed to save card");
      }
    } catch (error) {
      onError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="stripe-element">
        <CardElement
          options={{
            style: {
              base: {
                fontSize: '14px',
                color: '#1e293b',
                '::placeholder': { color: '#94a3b8' },
              },
            },
          }}
          onChange={(e) => setCardComplete(e.complete)}
        />
      </div>
      <div className="flex items-center gap-2 text-xs text-gray-500">
        <Lock size={12} className="text-green-500" />
        <span>Your card details are encrypted and secure</span>
      </div>
      <button
        type="submit"
        disabled={loading || !cardComplete || !stripe}
        className="btn-primary w-full flex items-center justify-center gap-2"
      >
        {loading ? <Loader2 size={16} className="animate-spin" /> : <CreditCard size={16} />}
        {loading ? "Adding Card..." : "Add Card"}
      </button>
    </form>
  );
}

// ✅ Main Payment Options Component
function PaymentOptionsContent() {
  const router = useRouter();
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [addMethodType, setAddMethodType] = useState("card");
  const [stripeError, setStripeError] = useState("");
  const [stripeSuccess, setStripeSuccess] = useState(false);
  
  const [newMethod, setNewMethod] = useState({
    type: "jazzcash",
    accountNo: "",
    nameOnAccount: "",
  });

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/signin");
      return;
    }
    fetchPaymentMethods();
  }, []);

  const fetchPaymentMethods = async () => {
    const token = localStorage.getItem("token");
    try {
      const res = await fetch("/api/user/payment-methods", {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setPaymentMethods(data.methods || []);
      }
    } catch (error) {
      console.error("Error fetching payment methods:", error);
    } finally {
      setLoading(false);
    }
  };

  const addManualPaymentMethod = async () => {
    if (!newMethod.accountNo.trim()) {
      alert("Please enter account number");
      return;
    }

    const token = localStorage.getItem("token");
    setSubmitting(true);
    try {
      const res = await fetch("/api/user/payment-methods", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          type: newMethod.type,
          accountNo: newMethod.accountNo,
          nameOnAccount: newMethod.nameOnAccount,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setPaymentMethods(data.methods);
        setShowAddForm(false);
        setNewMethod({ type: "jazzcash", accountNo: "", nameOnAccount: "" });
      } else {
        alert(data.message || "Failed to add payment method");
      }
    } catch (error) {
      console.error("Error adding payment method:", error);
      alert("Something went wrong");
    } finally {
      setSubmitting(false);
    }
  };

  const deletePaymentMethod = async (methodId) => {
    if (!confirm("Are you sure you want to delete this payment method?")) return;

    const token = localStorage.getItem("token");
    try {
      const res = await fetch(`/api/user/payment-methods?id=${methodId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setPaymentMethods(data.methods);
      } else {
        alert(data.message || "Failed to delete");
      }
    } catch (error) {
      console.error("Error deleting payment method:", error);
      alert("Something went wrong");
    }
  };

  const setDefaultMethod = async (methodId) => {
    const token = localStorage.getItem("token");
    try {
      const res = await fetch("/api/user/payment-methods", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ methodId }),
      });
      const data = await res.json();
      if (data.success) {
        setPaymentMethods(data.methods);
      }
    } catch (error) {
      console.error("Error setting default:", error);
    }
  };

  const onStripeSuccess = (methods) => {
    setPaymentMethods(methods);
    setShowAddForm(false);
    setStripeSuccess(true);
    setStripeError("");
    setTimeout(() => setStripeSuccess(false), 3000);
  };

  const onStripeError = (error) => {
    setStripeError(error);
    setTimeout(() => setStripeError(""), 4000);
  };

  const getPaymentIcon = (type, brand = null) => {
    const icons = {
      card: { icon: CardIcon, color: "#7c3aed", bg: "#ede9fe" },
      jazzcash: { icon: Smartphone, color: "#e11d48", bg: "#fee2e2" },
      easypaisa: { icon: Wallet, color: "#16a34a", bg: "#dcfce7" },
      bank: { icon: Building, color: "#2563eb", bg: "#dbeafe" },
    };
    return icons[type] || icons.card;
  };

  const getDisplayName = (type, brand = null) => {
    const names = {
      jazzcash: "JazzCash",
      easypaisa: "EasyPaisa",
      bank: "Bank Account",
      card: brand ? `${brand.charAt(0).toUpperCase() + brand.slice(1)} ••••` : "Credit/Debit Card"
    };
    return names[type] || type;
  };

  if (loading) {
    return (
      <div className="pay-page">
        <Navbar />
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader2 size={40} className="animate-spin text-[#00bcd4]" />
        </div>
      </div>
    );
  }

  return (
    <>
      <style>{STYLES}</style>
      <div className="pay-page">
        <Navbar />

        <div className="max-w-4xl mx-auto px-4 py-12">
          
          {/* Header */}
          <div className="text-center mb-10">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#00bcd4] to-[#0097a7] flex items-center justify-center mx-auto mb-4 shadow-lg">
              <CreditCard size={28} className="text-white" />
            </div>
            <h1 className="hph text-3xl font-bold text-gray-800 mb-2">Payment Options</h1>
            <p className="text-gray-500">Manage your saved payment methods</p>
          </div>

          {/* Security Note */}
          <div className="glass-card p-4 mb-6 flex items-center gap-3">
            <Shield size={18} className="text-[#0097a7]" />
            <p className="text-sm text-gray-600">
              Your payment information is secure with 256-bit SSL encryption
            </p>
            <span className="badge-premium ml-auto">PCI Compliant</span>
          </div>

          {/* Payment Methods List */}
          <div className="glass-card p-6 mb-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="hph text-xl font-bold text-gray-800">Saved Methods</h2>
              <span className="text-sm text-gray-500">
                {paymentMethods.length} {paymentMethods.length === 1 ? 'method' : 'methods'}
              </span>
            </div>

            {paymentMethods.length === 0 ? (
              <div className="text-center py-10">
                <CreditCard size={48} className="mx-auto text-gray-300 mb-3" />
                <p className="text-gray-500">No payment methods added yet</p>
                <button
                  onClick={() => setShowAddForm(true)}
                  className="mt-4 btn-primary"
                >
                  <Plus size={16} className="inline mr-2" />
                  Add Payment Method
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {paymentMethods.map((method, idx) => {
                  const { icon: Icon, color, bg } = getPaymentIcon(method.type, method.brand);
                  const isDefault = method.isDefault;
                  const displayName = getDisplayName(method.type, method.brand);
                  
                  return (
                    <div 
                      key={method._id} 
                      className={`method-card ${isDefault ? 'default' : ''} fade-up`}
                      style={{ animationDelay: `${idx * 50}ms` }}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="icon-circle" style={{ background: bg }}>
                            <Icon size={20} style={{ color }} />
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <p className="font-semibold text-gray-800">
                                {displayName}
                              </p>
                              {isDefault && (
                                <span className="text-xs px-2 py-0.5 rounded-full bg-[#00bcd4]/10 text-[#0097a7] font-semibold flex items-center gap-1">
                                  <Star size={10} /> Default
                                </span>
                              )}
                              {method.type === "card" && method.brand && (
                                <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-600 font-medium">
                                  {method.brand}
                                </span>
                              )}
                            </div>
                            <p className="text-sm text-gray-500">
                              {method.accountNo || (method.last4 && `•••• ${method.last4}`)}
                            </p>
                            {method.nameOnAccount && (
                              <p className="text-xs text-gray-400">{method.nameOnAccount}</p>
                            )}
                          </div>
                        </div>
                        <div className="flex gap-2">
                          {!isDefault && (
                            <button
                              onClick={() => setDefaultMethod(method._id)}
                              className="p-2 rounded-lg hover:bg-gray-100 transition text-gray-500 hover:text-[#00bcd4]"
                              title="Set as default"
                            >
                              <Star size={16} />
                            </button>
                          )}
                          <button
                            onClick={() => deletePaymentMethod(method._id)}
                            className="p-2 rounded-lg hover:bg-red-50 transition text-gray-400 hover:text-red-500"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Add Button */}
            {paymentMethods.length > 0 && !showAddForm && (
              <button
                onClick={() => setShowAddForm(true)}
                className="mt-5 w-full py-3 rounded-xl border-2 border-dashed border-[#00bcd4] text-[#0097a7] font-semibold flex items-center justify-center gap-2 hover:bg-[#00bcd4]/5 transition"
              >
                <Plus size={18} /> Add Payment Method
              </button>
            )}
          </div>

          {/* Add Form */}
          {showAddForm && (
            <div className="glass-card p-6 fade-up">
              <div className="flex justify-between items-center mb-4">
                <h3 className="hph text-lg font-bold text-gray-800">
                  Add New Payment Method
                </h3>
                <button
                  onClick={() => setShowAddForm(false)}
                  className="p-1 hover:bg-gray-100 rounded-lg transition"
                >
                  <X size={20} className="text-gray-400" />
                </button>
              </div>

              {/* Payment Type Tabs */}
              <div className="flex gap-2 mb-4 overflow-x-auto pb-2">
                {[
                  { id: "card", label: "💳 Credit Card", icon: CardIcon },
                  { id: "jazzcash", label: "📱 JazzCash", icon: Smartphone },
                  { id: "easypaisa", label: "📱 EasyPaisa", icon: Wallet },
                  { id: "bank", label: "🏦 Bank Transfer", icon: Building },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setAddMethodType(tab.id)}
                    className={`px-4 py-2 rounded-xl text-sm font-semibold transition ${
                      addMethodType === tab.id
                        ? "bg-[#00bcd4] text-white shadow-md"
                        : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              {addMethodType === "card" && (
                // ✅ Stripe Card Form
                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <CreditCard size={16} className="text-[#00bcd4]" />
                    <span>Enter your card details securely</span>
                  </div>
                  
                  {stripeError && (
                    <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm">
                      ❌ {stripeError}
                    </div>
                  )}
                  
                  {stripeSuccess && (
                    <div className="p-3 bg-green-50 border border-green-200 rounded-xl text-green-600 text-sm">
                      ✅ Card added successfully!
                    </div>
                  )}

                  <Elements stripe={loadStripe(STRIPE_PUBLISHABLE_KEY)}>
                    <StripeCardForm
                      onSuccess={onStripeSuccess}
                      onError={onStripeError}
                      loading={submitting}
                      setLoading={setSubmitting}
                    />
                  </Elements>
                </div>
              )}

              {(addMethodType === "jazzcash" || addMethodType === "easypaisa" || addMethodType === "bank") && (
                // ✅ Manual Entry (Mobile Wallet / Bank)
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Account Number
                    </label>
                    <input
                      type="text"
                      placeholder={addMethodType === "jazzcash" ? "e.g., 03001234567" : "e.g., 1234-5678-9012"}
                      value={newMethod.accountNo}
                      onChange={(e) => setNewMethod({...newMethod, accountNo: e.target.value})}
                      className="form-input"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Name on Account (Optional)
                    </label>
                    <input
                      type="text"
                      placeholder="e.g., Ali Raza"
                      value={newMethod.nameOnAccount}
                      onChange={(e) => setNewMethod({...newMethod, nameOnAccount: e.target.value})}
                      className="form-input"
                    />
                  </div>

                  <button
                    onClick={addManualPaymentMethod}
                    disabled={submitting}
                    className="btn-primary w-full flex items-center justify-center gap-2"
                  >
                    {submitting ? <Loader2 size={16} className="animate-spin" /> : <CheckCircle size={16} />}
                    {submitting ? "Adding..." : "Add Payment Method"}
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Security Info */}
          <div className="mt-6 flex items-start gap-3 p-4 bg-amber-50 rounded-xl border border-amber-200">
            <AlertCircle size={18} className="text-amber-600 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-amber-800">Secure Storage</p>
              <p className="text-xs text-amber-700">
                We never store your full card details. All transactions are processed via secure payment gateways.
              </p>
            </div>
          </div>

        </div>
      </div>
    </>
  );
}

// ✅ Main Export with Stripe Elements Provider
export default function PaymentOptionsPage() {
  return <PaymentOptionsContent />;
}