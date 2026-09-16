import { useMemo, useState } from "react";
import "./App.css";

const categories = ["All", "Food", "Burger", "Pizza", "Hot Drink", "Soft Drink"];

const menuItems = [
  {
    id: 1,
    name: "Chicken Burger",
    category: "Burger",
    description: "Grilled chicken, fresh vegetables and house sauce.",
    price: 280,
    emoji: "🍔",
  },
  {
    id: 2,
    name: "Classic Beef Burger",
    category: "Burger",
    description: "Juicy beef patty, cheese, lettuce and special sauce.",
    price: 320,
    emoji: "🍔",
  },
  {
    id: 3,
    name: "Margherita Pizza",
    category: "Pizza",
    description: "Tomato, mozzarella, basil and Italian herbs.",
    price: 420,
    emoji: "🍕",
  },
  {
    id: 4,
    name: "Chicken Pizza",
    category: "Pizza",
    description: "Chicken, mozzarella, peppers and special seasoning.",
    price: 520,
    emoji: "🍕",
  },
  {
    id: 5,
    name: "Special Pasta",
    category: "Food",
    description: "Creamy pasta with vegetables and your choice of sauce.",
    price: 350,
    emoji: "🍝",
  },
  {
    id: 6,
    name: "French Fries",
    category: "Food",
    description: "Crispy golden fries with house seasoning.",
    price: 180,
    emoji: "🍟",
  },
  {
    id: 7,
    name: "Macchiato",
    category: "Hot Drink",
    description: "Freshly brewed Ethiopian coffee with steamed milk.",
    price: 100,
    emoji: "☕",
  },
  {
    id: 8,
    name: "Cappuccino",
    category: "Hot Drink",
    description: "Espresso with steamed milk and soft foam.",
    price: 150,
    emoji: "☕",
  },
  {
    id: 9,
    name: "Coca-Cola",
    category: "Soft Drink",
    description: "Chilled Coca-Cola.",
    price: 100,
    emoji: "🥤",
  },
  {
    id: 10,
    name: "Sprite",
    category: "Soft Drink",
    description: "Chilled Sprite.",
    price: 100,
    emoji: "🥤",
  },
];

function App() {
  const [category, setCategory] = useState("All");
  const [cart, setCart] = useState([]);
  const [customerName, setCustomerName] = useState("");
  const [tableNumber, setTableNumber] = useState("");
  const [showCart, setShowCart] = useState(false);
  const [ordering, setOrdering] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const filteredItems = useMemo(() => {
    if (category === "All") return menuItems;
    return menuItems.filter((item) => item.category === category);
  }, [category]);

  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);

  const totalPrice = cart.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  function addToCart(item) {
    setCart((current) => {
      const existing = current.find((cartItem) => cartItem.id === item.id);

      if (existing) {
        return current.map((cartItem) =>
          cartItem.id === item.id
            ? { ...cartItem, quantity: cartItem.quantity + 1 }
            : cartItem
        );
      }

      return [...current, { ...item, quantity: 1 }];
    });
  }

  function updateQuantity(id, amount) {
    setCart((current) =>
      current
        .map((item) =>
          item.id === id
            ? { ...item, quantity: item.quantity + amount }
            : item
        )
        .filter((item) => item.quantity > 0)
    );
  }

  async function submitOrder(e) {
    e.preventDefault();
    setError("");

    if (!customerName.trim()) {
      setError("Please enter your name.");
      return;
    }

    if (!tableNumber.trim()) {
      setError("Please enter your table number.");
      return;
    }

    if (cart.length === 0) {
      setError("Your cart is empty.");
      return;
    }

    setOrdering(true);

    try {
      const response = await fetch("/api/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          customerName: customerName.trim(),
          tableNumber: tableNumber.trim(),
          items: cart.map((item) => ({
            name: item.name,
            quantity: item.quantity,
            price: item.price,
          })),
          total: totalPrice,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Unable to place order.");
      }

      setCart([]);
      setCustomerName("");
      setTableNumber("");
      setShowCart(false);
      setSuccess(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setOrdering(false);
    }
  }

  return (
    <div className="app">
      <header className="header">
        <div className="brand">
          <div className="brand-mark">T</div>

          <div>
            <h1>Telos</h1>
            <span>Food Court</span>
          </div>
        </div>

        <button className="cart-button" onClick={() => setShowCart(true)}>
          <span>🛒</span>
          {totalItems > 0 && <b>{totalItems}</b>}
        </button>
      </header>

      <main>
        <section className="hero">
          <span className="eyebrow">WELCOME TO TELOS</span>
          <h2>Good food.<br />Good moments.</h2>
          <p>Freshly prepared favorites, made for you.</p>
        </section>

        <div className="category-wrapper">
          <div className="categories">
            {categories.map((item) => (
              <button
                key={item}
                className={category === item ? "active" : ""}
                onClick={() => setCategory(item)}
              >
                {item}
              </button>
            ))}
          </div>
        </div>

        <section className="menu">
          <div className="section-heading">
            <div>
              <span>OUR MENU</span>
              <h3>{category === "All" ? "Popular choices" : category}</h3>
            </div>

            <span className="item-count">
              {filteredItems.length} items
            </span>
          </div>

          <div className="menu-grid">
            {filteredItems.map((item) => (
              <article className="menu-card" key={item.id}>
                <div className="food-image">
                  <span>{item.emoji}</span>
                </div>

                <div className="food-content">
                  <div className="food-top">
                    <h4>{item.name}</h4>
                    <strong>{item.price} ETB</strong>
                  </div>

                  <p>{item.description}</p>

                  <button
                    className="add-button"
                    onClick={() => addToCart(item)}
                  >
                    <span>Add to order</span>
                    <span>+</span>
                  </button>
                </div>
              </article>
            ))}
          </div>
        </section>
      </main>

      {totalItems > 0 && !showCart && (
        <button className="floating-cart" onClick={() => setShowCart(true)}>
          <span>
            🛒 {totalItems} {totalItems === 1 ? "item" : "items"}
          </span>

          <strong>{totalPrice} ETB</strong>
        </button>
      )}

      {showCart && (
        <div className="overlay" onClick={() => setShowCart(false)}>
          <aside className="cart-panel" onClick={(e) => e.stopPropagation()}>
            <div className="cart-header">
              <div>
                <span>YOUR ORDER</span>
                <h3>Order summary</h3>
              </div>

              <button
                className="close-button"
                onClick={() => setShowCart(false)}
              >
                ×
              </button>
            </div>

            <div className="cart-items">
              {cart.length === 0 ? (
                <div className="empty-cart">
                  <span>🛒</span>
                  <h4>Your cart is empty</h4>
                  <p>Add something delicious from the menu.</p>
                </div>
              ) : (
                cart.map((item) => (
                  <div className="cart-item" key={item.id}>
                    <div className="cart-item-icon">{item.emoji}</div>

                    <div className="cart-item-info">
                      <h4>{item.name}</h4>
                      <span>{item.price} ETB</span>
                    </div>

                    <div className="quantity">
                      <button onClick={() => updateQuantity(item.id, -1)}>
                        −
                      </button>

                      <strong>{item.quantity}</strong>

                      <button onClick={() => updateQuantity(item.id, 1)}>
                        +
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            {cart.length > 0 && (
              <form className="checkout" onSubmit={submitOrder}>
                <div className="total">
                  <span>Total</span>
                  <strong>{totalPrice} ETB</strong>
                </div>

                <label>
                  Your name
                  <input
                    type="text"
                    placeholder="Enter your name"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                  />
                </label>

                <label>
                  Table number
                  <input
                    type="text"
                    placeholder="e.g. 12"
                    value={tableNumber}
                    onChange={(e) => setTableNumber(e.target.value)}
                  />
                </label>

                {error && <div className="error">{error}</div>}

                <button
                  className="order-button"
                  type="submit"
                  disabled={ordering}
                >
                  {ordering ? "Sending order..." : "Confirm order"}
                </button>
              </form>
            )}
          </aside>
        </div>
      )}

      {success && (
        <div className="success-overlay">
          <div className="success-card">
            <div className="success-icon">✓</div>
            <span>ORDER RECEIVED</span>
            <h3>Thank you!</h3>
            <p>
              Your order has been sent to Telos Food Court.
              Please wait while we prepare it.
            </p>

            <button
              onClick={() => setSuccess(false)}
              className="order-button"
            >
              Done
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
