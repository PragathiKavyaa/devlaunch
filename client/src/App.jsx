import { useState, useEffect } from "react";
import { Routes, Route, Link, useNavigate } from "react-router-dom";
import {
  ArrowUpRight, Menu, X, Code2, Layers3, ShoppingCart, BarChart3,
  Smartphone, ShieldCheck, Sparkles, CheckCircle2, Send, LogOut, Trash2, RefreshCw
} from "lucide-react";

const API = (import.meta.env.VITE_API_URL || "http://localhost:5000").replace(/\/$/, "");

const services = [
  { icon: Code2, title: "Web development", text: "Fast, accessible websites that turn visitors into customers." },
  { icon: Layers3, title: "Product design", text: "Clear user journeys and polished interfaces built around people." },
  { icon: ShoppingCart, title: "E-commerce", text: "Shopping experiences designed to make every step feel simple." },
  { icon: BarChart3, title: "Business tools", text: "Dashboards and workflows that help teams make smarter decisions." }
];


const packages = [
  {
    name: "Starter",
    price: "₹4,999",
    description: "A clean online presence for individuals and small businesses.",
    features: [
      "Up to 3 website pages",
      "Responsive mobile design",
      "Contact enquiry form",
      "Basic SEO setup",
      "Deployment assistance"
    ]
  },
  {
    name: "Business",
    price: "₹9,999",
    description: "A more complete website for growing businesses.",
    features: [
      "Up to 6 website pages",
      "Custom UI and animations",
      "Enquiry form with database",
      "Admin enquiry management",
      "Deployment assistance"
    ],
    popular: true
  },
  {
    name: "Full Stack",
    price: "₹19,999+",
    description: "A web application with frontend, backend, and database.",
    features: [
      "React frontend",
      "Node.js and Express API",
      "MySQL database integration",
      "Authentication features",
      "Admin dashboard",
      "Deployment support"
    ]
  }
];


function Header() {
  const [open, setOpen] = useState(false);
  return <header className="header"><nav className="nav container">
    <Link className="brand" to="/" onClick={() => setOpen(false)}><span className="brand-mark">D</span> devlaunch<span className="brand-dot">.</span></Link>
    <button className="menu-toggle" aria-label="Toggle navigation" onClick={() => setOpen(!open)}>{open ? <X/> : <Menu/>}</button>
    <div className={`nav-links ${open ? "is-open" : ""}`}>
      <a href="/#services" onClick={() => setOpen(false)}>Services</a>
      <a href="/#packages" onClick={() => setOpen(false)}>Packages</a>
      <a href="/#feedback" onClick={() => setOpen(false)}>Feedback</a>
      <a href="/#about" onClick={() => setOpen(false)}>About</a>
      <a href="/#process" onClick={() => setOpen(false)}>Our process</a>
      <a className="nav-cta" href="/#contact" onClick={() => setOpen(false)}>Let's talk <ArrowUpRight size={16}/></a>
    </div>
  </nav></header>;
}

function ContactForm() {
  const [form, setForm] = useState({ name: "", email: "", service: "Web development", message: "" });
  const [state, setState] = useState({ loading: false, message: "", error: false });
  function update(event) { setForm({ ...form, [event.target.name]: event.target.value }); }
  async function submit(event) {
    event.preventDefault();
    setState({ loading: true, message: "", error: false });
    try {
      const response = await fetch(`${API}/api/enquiries`, {
        method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form)
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Something went wrong.");
      setState({ loading: false, message: data.message, error: false });
      setForm({ name: "", email: "", service: "Web development", message: "" });
    } catch (error) {
      setState({ loading: false, message: `${error.message} Check that the API server is running.`, error: true });
    }
  }
  return <form className="contact-form" onSubmit={submit}>
    <div className="form-row">
      <label>Your name<input name="name" value={form.name} onChange={update} required maxLength="100" placeholder="Jane Smith"/></label>
      <label>Email address<input name="email" type="email" value={form.email} onChange={update} required maxLength="190" placeholder="jane@company.com"/></label>
    </div>
    <label>What do you need?
      <select name="service" value={form.service} onChange={update}>
        {["Web development", "Product design", "E-commerce", "Business tools", "Something else"].map(s => <option key={s}>{s}</option>)}
      </select>
    </label>
    <label>Tell us a little about your project<textarea name="message" value={form.message} onChange={update} required maxLength="3000" rows="4" placeholder="What would you like to build?"/></label>
    {state.message && <p className={state.error ? "form-message error" : "form-message success"} role="status">{state.message}</p>}
    <button className="button button-primary submit-button" disabled={state.loading}>{state.loading ? "Sending..." : <>Send enquiry <Send size={16}/></>}</button>
  </form>;
}


function FeedbackSection() {
  const [name, setName] = useState("");
  const [rating, setRating] = useState("5");
  const [review, setReview] = useState("");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [approvedFeedback, setApprovedFeedback] = useState([]);

  useEffect(() => {let cancelled = false;

  async function loadApprovedFeedback() {
    try {
      const response = await fetch(`${API}/api/feedback`, {
        cache: "no-store",
      });

      if (!response.ok) {
        throw new Error("Could not load approved feedback.");
      }

      const data = await response.json();

      const reviews = Array.isArray(data)
      ? data
      : Array.isArray(data.value)
        ? data.value
        : Array.isArray(data.feedback)
          ? data.feedback
          : [];
      
      const approved = reviews.sort(
      (a, b) =>
      new Date(b.created_at).getTime() -
      new Date(a.created_at).getTime()
      );

      if (!cancelled) {
        setApprovedFeedback(approved);
      }
    } catch (error) {
      console.error("Could not load public feedback:", error);
    }
  }

  loadApprovedFeedback();

  return () => {
    cancelled = true;
  };
}, []);

  async function handleSubmit(event) {
    event.preventDefault();
    setMessage("");
    setSubmitting(true);

    try {
      const response = await fetch(`${API}/api/feedback`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: name.trim(),
          rating: Number(rating),
          review: review.trim(),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Could not submit feedback.");
      }

      setName("");
      setRating("5");
      setReview("");
      setMessage(
        "Thank you! Your feedback has been submitted for approval."
      );
    } catch (error) {
      setMessage(error.message || "Unable to submit feedback.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
  <section className="feedback-section" id="feedback">

    {/* APPROVED CUSTOMER FEEDBACK */}
    <div className="container approved-feedback">
      <div className="section-heading">
        <span className="eyebrow">WHAT OUR CUSTOMERS SAY</span>
        <h2>
          Feedback that <em>matters.</em>
        </h2>
        <p>Real experiences shared by our customers.</p>
      </div>

      {approvedFeedback.length > 0 ? (
        <div className="approved-feedback-grid">
          {approvedFeedback.map((item) => {
            const stars = Math.max(
              0,
              Math.min(5, Number(item.rating) || 0)
            );

            return (
              <article
                className="approved-feedback-card"
                key={item.id}
              >
                <div
                  className="approved-feedback-stars"
                  aria-label={`${stars} out of 5 stars`}
                >
                  {"★".repeat(stars)}
                  {"☆".repeat(5 - stars)}
                </div>

                <p className="approved-feedback-review">
                  “{item.review}”
                </p>

                <div className="approved-feedback-author">
                  <strong>
                    {item.customer_name || item.name || "Customer"}
                  </strong>
                  <span>Approved customer feedback</span>
                </div>
              </article>
            );
          })}
        </div>
      ) : (
        <p className="approved-feedback-empty">
          Customer feedback will appear here after approval.
        </p>
      )}
    </div>

    {/* YOUR EXISTING FORM AND CONTENT — KEEP UNCHANGED */}
    <div className="feedback-layout"></div>
      <div className="feedback-layout">
        {/* LEFT: Customer feedback form */}
        <form className="feedback-form" onSubmit={handleSubmit}>
          <label>
            Your name
            <input
              type="text"
              name="name"
              placeholder="Enter your name"
              value={name}
              onChange={(event) => setName(event.target.value)}
              required
              maxLength={100}
            />
          </label>

          <label>
            Your rating
            <select
              name="rating"
              value={rating}
              onChange={(event) => setRating(event.target.value)}
              required
            >
              <option value="5">★★★★★ — Excellent</option>
              <option value="4">★★★★ — Very good</option>
              <option value="3">★★★ — Good</option>
              <option value="2">★★ — Fair</option>
              <option value="1">★ — Needs improvement</option>
            </select>
          </label>

          <label>
            Your feedback
            <textarea
              name="review"
              placeholder="Tell us about your experience..."
              rows={5}
              value={review}
              onChange={(event) => setReview(event.target.value)}
              required
              maxLength={2000}
            />
          </label>

          <button type="submit" disabled={submitting}>
            {submitting ? "Submitting..." : "Submit feedback"}
            {!submitting && (
              <span aria-hidden="true"> →</span>
            )}
          </button>

          {message && (
            <p
              className="feedback-message"
              role="status"
              aria-live="polite"
            >
              {message}
            </p>
          )}
        </form>

        {/* RIGHT: Feedback heading and supporting content */}
        <div className="feedback-content">
          <div className="section-heading">
            <span className="eyebrow">CUSTOMER FEEDBACK</span>

            <h2>
              Your experience.
              <br />
              <em>Our next improvement.</em>
            </h2>

            <p>
              Your feedback helps us improve our web development
              services and create better digital experiences.
              Share your thoughts with the DevLaunch team.
            </p>
          </div>

          <div className="feedback-highlights">
            <article className="feedback-highlight">
              <div className="feedback-highlight-icon">✦</div>
              <div>
                <h3>Your voice matters</h3>
                <p>
                  Help us understand what works well and what we can improve.
                </p>
              </div>
            </article>

            <article className="feedback-highlight">
              <div className="feedback-highlight-icon">↗</div>
              <div>
                <h3>Help us grow</h3>
                <p>
                  Your suggestions help us build a better experience for every client.
                </p>
              </div>
            </article>
          </div>
        </div>
      </div>
    </section>
  );
}

function LandingPage() {
  const [siteContent, setSiteContent] = useState({});

  useEffect(() => {
    let cancelled = false;

    async function fetchSiteContent() {
      try {
        const response = await fetch(`${API}/api/content`, {
          cache: "no-store",
        });

        if (!response.ok) {
          throw new Error(`Content request failed: ${response.status}`);
        }

        const data = await response.json();

        if (!cancelled) {
          setSiteContent(data);
        }
      } catch (error) {
        console.error("Could not load public website content:", error);
      }
    }

    fetchSiteContent();

    return () => {
      cancelled = true;
    };
  }, []);

useEffect(() => {
  const elements = document.querySelectorAll(
    ".scroll-reveal, .scroll-left, .scroll-right, .scroll-zoom, .scroll-stagger > *"
  );

  const prefersReducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  ).matches;

  if (prefersReducedMotion || !("IntersectionObserver" in window)) {
    elements.forEach((element) => {
      element.classList.add("is-visible");
    });
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          // Play the animation when the element enters the screen
          entry.target.classList.add("is-visible");
        } else {
          // Reset it when the element leaves the screen
          entry.target.classList.remove("is-visible");
        }
      });
    },
    {
      threshold: 0.15,
      rootMargin: "0px 0px -30px 0px",
    }
  );

  elements.forEach((element) => observer.observe(element));

  return () => observer.disconnect();
}, [siteContent]);

  return <>
    <Header/>
    <main>
      <section className="hero container">
        <div className="hero-copy scroll-left">
          <div className="eyebrow"><span className="pulse"></span> YOUR IDEAS, BUILT BETTER</div>
          <h1>Build what's next.<br/><span>Make it matter.</span></h1>
          <p className="hero-text">We turn ambitious ideas into useful digital experiences — from your first landing page to the product that takes you further.</p>
          <div className="hero-actions"><a className="button button-primary" href="#contact">Start a project <ArrowUpRight size={17}/></a><a className="text-link" href="#services">Explore what we do <span>↘</span></a></div>
          <div className="hero-proof"><div className="avatar-stack"><span>JD</span><span>AK</span><span>MK</span></div><div><strong>Small team. Big ideas.</strong><small>Thoughtful work, from start to launch.</small></div></div>
        </div>
        <div className="hero-art scroll-right" aria-label="Abstract digital product illustration">
          <div className="art-glow"></div><div className="orbit orbit-one"></div><div className="orbit orbit-two"></div>
          <div className="floating-card card-top"><span className="tiny-label">PROJECT STATUS</span><strong><span className="status-dot"></span> Moving forward</strong><div className="progress"><i></i></div></div>
          <div className="main-art-card"><div className="art-card-top"><span className="window-dots">● ● ●</span><span>devlaunch / studio</span><Sparkles size={17}/></div><div className="art-abstract"><div className="abstract-block block-a"></div><div className="abstract-block block-b"></div><div className="abstract-block block-c"></div><div className="abstract-ring"></div></div><div className="art-card-bottom"><div><small>DESIGN SYSTEM</small><strong>Made to move</strong></div><span className="round-arrow"><ArrowUpRight size={20}/></span></div></div>
          <div className="floating-card card-bottom"><span className="mini-icon"><CheckCircle2 size={18}/></span><div><strong>Ready to launch</strong><small>Every detail, considered.</small></div></div>
          <div className="spark spark-one">✳</div><div className="spark spark-two">✦</div>
        </div>
        <div className="hero-bottom"><span>DESIGN WITH INTENTION</span><span className="hero-bottom-line"></span><span>BUILD WITH PURPOSE</span></div>
      </section>
      <section className="trust-strip"><div className="container trust-inner"><span>GOOD IDEAS DESERVE</span><strong>CLARITY</strong><b>✳</b><strong>CRAFT</strong><b>✳</b><strong>CARE</strong></div></section>
      <section className="section container" id="services">
        <div className="section-heading scroll-reveal"><div><span className="eyebrow">WHAT WE DO</span><h2>Digital work that<br/>works <em>for you.</em></h2></div><p>Great technology should make things easier. We bring strategy, design, and development together to build solutions with a real purpose.</p></div>
        
        
<div className="services-grid scroll-stagger">
  {(Array.isArray(siteContent.services) &&
  siteContent.services.length > 0
    ? siteContent.services
    : services
  ).map((service, i) => {
    const defaults =
      services.find((item) => item.title === service.title) ||
      services[i] ||
      services[0];

    const Icon = defaults.icon || Code2;
    const title = service.title || defaults.title;
    const text =
      service.description ||
      service.text ||
      defaults.text;

    return (
      <article
        className="service-card"
        key={`${title}-${i}`}
      >
        <div className="service-top">
          <span className="service-icon">
            <Icon size={22} />
          </span>
          <span className="service-number">
            0{i + 1}
          </span>
        </div>

        <h3>{title}</h3>
        <p>{text}</p>

        <a
          href="#contact"
          aria-label={`Ask us about ${title}`}
          className="service-arrow"
        >
          <ArrowUpRight size={19} />
        </a>
      </article>
    );
  })}
</div>

  </section>
      
      <section className="section packages-section container" id="packages">
        <div className="section-heading scroll-reveal">
          <div>
            <span className="eyebrow">SIMPLE, CLEAR PRICING</span>
            <h2>Choose your<br />development <em>plan.</em></h2>
          </div>
          <p>
            From a simple business website to a complete full-stack
            application, choose a starting package that fits your goals.
          </p>
        </div>

        <div className="packages-grid scroll-stagger">
          {(Array.isArray(siteContent.packages) && siteContent.packages.length > 0
          ? siteContent.packages
          : packages
          ).map((pkg, index) => (
            <article
              className={`package-card ${pkg.popular ? "package-featured" : ""}`}
              key={pkg.name}
              style={{ "--card-index": index }}
            >
              {pkg.popular && (
                <span className="package-badge">MOST POPULAR</span>
              )}

              <span className="package-label">
                0{index + 1} / DEVELOPMENT PLAN
              </span>

              <h3>{pkg.name}</h3>
              <p className="package-description">{pkg.description}</p>

              <div className="package-price">
                {pkg.price}
                <small>{pkg.name === "Full Stack" ? " and up" : " / project"}</small>
              </div>

              <div className="package-divider"></div>

              <ul className="package-features">
                {pkg.features.map((feature) => (
                  <li key={feature}>
                    <CheckCircle2 size={17} />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>

              <a
                className={`button ${pkg.popular ? "button-primary" : "package-button"}`}
                href="#contact"
              >
                Discuss this package <ArrowUpRight size={16} />
              </a>
            </article>
          ))}
        </div>

        <p className="packages-note">
          Need something different? Contact us for a custom project quote.
        </p>
      </section>

      <section className="about-section" id="about"><div className="container about-layout"><div className="about-art scroll-left"><div className="about-sticker"><Sparkles size={22}/><span>Curious minds.<br/>Careful makers.</span></div><div className="about-shape shape-one"></div><div className="about-shape shape-two"></div><div className="about-orbit"></div><span className="about-caption">IDEAS IN MOTION — EST. 2026</span></div><div className="about-copy scroll-right"><span className="eyebrow">A LITTLE ABOUT US</span><h2>Less noise.<br/>More <em>meaning.</em></h2><p>We're a digital team that believes the best work happens when clear thinking meets good craft. No unnecessary complexity — just useful, thoughtful products built around your goals.</p><ul><li><CheckCircle2/> Clear communication, at every step</li><li><CheckCircle2/> Practical solutions, not buzzwords</li><li><CheckCircle2/> Built to grow with your business</li></ul><a className="text-link dark-link" href="#contact">Let's build something useful <ArrowUpRight size={17}/></a></div></div></section>
      <section className="section container process-section" id="process"><div className="section-heading scroll-reveal"><div><span className="eyebrow">HOW WE WORK</span><h2>From first thought<br/>to <em>first launch.</em></h2></div><p>A simple, collaborative process keeps the work focused and helps everyone know what comes next.</p></div><div className="process-grid scroll-stagger">{[{n:"01",t:"Discover",d:"We learn about your goals, your audience, and the problem to solve."},{n:"02",t:"Design",d:"We shape the experience and agree on a clear direction before building."},{n:"03",t:"Develop",d:"We turn the plan into a responsive, tested product."},{n:"04",t:"Launch",d:"We help you go live and plan the next improvements."}].map(s=><article key={s.n} className="process-step"><span>{s.n}</span><h3>{s.t}</h3><p>{s.d}</p></article>)}</div></section>
      <section className="contact-section" id="contact"><div className="container contact-layout"><div className="contact-copy scroll-left"><span className="eyebrow">HAVE A PROJECT IN MIND?</span><h2>Let's make<br/>something <em>good.</em></h2><p>Tell us what you're thinking. A rough idea is a perfectly good place to start.</p><div className="contact-note"><span className="note-icon"><ShieldCheck/></span><span><strong>Good conversations start here.</strong><small>Your details are sent securely to our project team.</small></span></div></div><div className="contact-form-wrap scroll-right"><ContactForm/></div></div></section>
      <FeedbackSection />
    </main>
    <footer className="footer"><div className="container footer-inner"><Link className="brand" to="/"><span className="brand-mark">D</span> devlaunch<span className="brand-dot">.</span></Link><span>Thoughtful digital, built together.</span><div><a href="#services">Services</a><a href="#packages">Packages</a><a href="#contact">Contact</a></div><small>© {new Date().getFullYear()} DevLaunch Studio</small></div></footer>
  </>;
}

function AdminPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("admin@devlaunch.local");
  const [password, setPassword] = useState("");
  const [token, setToken] = useState(
  () => sessionStorage.getItem("devlaunch_admin_token") || "");
  const [items, setItems] = useState([]);
  const [feedback, setFeedback] = useState([]);
  const [content, setContent] = useState({});
  const [section, setSection] = useState("services");
  const [editor, setEditor] = useState("");
  const [tab, setTab] = useState("content");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const sections = [
    { key: "services", label: "Services" },
    { key: "packages", label: "Packages" },
  ];

  async function apiRequest(path, options = {}, auth = token) {
    console.log("API request starting:", options.method || "GET", `${API}${path}`);
    const response = await fetch(`${API}${path}`, {
      ...options,
      headers: {
        ...(options.body ? { "Content-Type": "application/json" } : {}),
        ...(auth ? { Authorization: `Bearer ${auth}` } : {}),
        ...options.headers,
      },
    });

    const data = await response.json().catch(() => ({}));
    console.log("API response:", response.status, data);

    if (!response.ok) {
      throw new Error(data.message || `Request failed (${response.status})`);
    }

    return data;
  }

  async function loadItems(auth = token) {
    const data = await apiRequest("/api/admin/enquiries", {}, auth);
    setItems(data);
  }

  async function loadContent(auth = token) {
    const data = await apiRequest("/api/content", {}, auth);
    setContent(data);
    setEditor(JSON.stringify(data[section] ?? {}, null, 2));
  }

  async function loadFeedback(auth = token) {
    const data = await apiRequest("/api/admin/feedback", {}, auth);
    setFeedback(data);
  }

  useEffect(() => {
  if (!token) return;

  let cancelled = false;

  async function restoreDashboard() {
    setLoading(true);

    try {
      const results = await Promise.allSettled([
        loadItems(token),
        loadContent(token),
        loadFeedback(token),
      ]);

      if (cancelled) return;

      const failed = results.find(
        (result) => result.status === "rejected"
      );

      if (failed) {
        setMessage(
          `Some dashboard data could not load: ${failed.reason.message}`
        );
      }
    } finally {
      if (!cancelled) setLoading(false);
    }
  }

  restoreDashboard();

  return () => {
    cancelled = true;
  };
}, []);

  async function login(event) {
    event.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      const data = await apiRequest(
        "/api/admin/login",
        {
          method: "POST",
          body: JSON.stringify({ email, password }),
        },
        ""
      );

      sessionStorage.setItem("devlaunch_admin_token", data.token);
      setToken(data.token);
      setPassword("");

      const results = await Promise.allSettled([
        loadItems(data.token),
        loadContent(data.token),
        loadFeedback(data.token),
      ]);

      const failed = results.find((result) => result.status === "rejected");

      if (failed) {
        setMessage(`Signed in, but some data could not load: ${failed.reason.message}`);
      } else {
        setMessage("Signed in successfully.");
      }
    } catch (error) {
      setMessage(error.message);
    } finally {
      setLoading(false);
    }
  }

  function selectSection(key) {
    setSection(key);
    setEditor(JSON.stringify(content[key] ?? {}, null, 2));
    setMessage("");
  }

  
async function saveContent(event) {
  event.preventDefault();
  setSaving(true);
  setMessage("");

  try {
    let parsed;

    try {
      parsed = JSON.parse(editor);
    } catch {
      throw new Error(
        "Invalid JSON. Check your commas, quotes, brackets, and braces."
      );
    }

    if (parsed === null || typeof parsed !== "object") {
      throw new Error("Content must be a JSON object or array.");
    }
    if (section === "services") {
  if (!Array.isArray(parsed)) {
    throw new Error(
      "Services must be a JSON array containing service objects."
    );
  }

  if (
    parsed.some(
      (service) =>
        !service ||
        typeof service !== "object" ||
        Array.isArray(service) ||
        typeof service.title !== "string" ||
        typeof (service.description ?? service.text) !== "string"
    )
  ) {
    throw new Error(
      "Each service needs a title and a description (or text)."
    );
  }
}

    console.log("Saving content section:", section);
    console.log("Content being sent:", parsed);

    const result = await apiRequest(`/api/admin/content/${section}`, {
      method: "PUT",
      body: JSON.stringify({ content: parsed }),
    });

    console.log("Save API response:", result);

    setContent((previous) => ({ ...previous, [section]: parsed }));
    setEditor(JSON.stringify(parsed, null, 2));
    setMessage(
      `${sections.find((item) => item.key === section)?.label} saved successfully.`
    );
  } catch (error) {
    console.error("Content save failed:", error);
    setMessage(error.message);
  } finally {
    setSaving(false);
  }
}

  async function changeStatus(id, status) {
    try {
      await apiRequest(`/api/admin/enquiries/${id}/status`, {
        method: "PATCH",
        body: JSON.stringify({ status }),
      });

      setItems((previous) =>
        previous.map((item) => item.id === id ? { ...item, status } : item)
      );
      setMessage("Enquiry status updated.");
    } catch (error) {
      setMessage(error.message);
    }
  }

  async function removeItem(id) {
    if (!window.confirm("Delete this enquiry permanently?")) return;

    try {
      await apiRequest(`/api/admin/enquiries/${id}`, { method: "DELETE" });
      setItems((previous) => previous.filter((item) => item.id !== id));
      setMessage("Enquiry deleted.");
    } catch (error) {
      setMessage(error.message);
    }
  }

  async function changeFeedbackStatus(id, status) {
    try {
      await apiRequest(`/api/admin/feedback/${id}/status`, {
        method: "PATCH",
        body: JSON.stringify({ status }),
      });

      setFeedback((previous) =>
        previous.map((item) => item.id === id ? { ...item, status } : item)
      );
      setMessage(`Feedback marked ${status.toLowerCase()}.`);
    } catch (error) {
      setMessage(error.message);
    }
  }

  async function removeFeedback(id) {
    if (!window.confirm("Delete this feedback permanently?")) return;

    try {
      await apiRequest(`/api/admin/feedback/${id}`, { method: "DELETE" });
      setFeedback((previous) => previous.filter((item) => item.id !== id));
      setMessage("Feedback deleted.");
    } catch (error) {
      setMessage(error.message);
    }
  }

  async function refreshCurrentTab() {
    setLoading(true);
    setMessage("");

    try {
      if (tab === "content") await loadContent();
      if (tab === "enquiries") await loadItems();
      if (tab === "feedback") await loadFeedback();
      setMessage("Data refreshed.");
    } catch (error) {
      setMessage(error.message);
    } finally {
      setLoading(false);
    }
  }

  function logout() {
    sessionStorage.removeItem("devlaunch_admin_token");
    setToken("");
    setPassword("");
    setItems([]);
    setFeedback([]);
    setContent({});
    setEditor("");
    setMessage("");
    navigate("/admin");
  }

  if (!token) {
    return (
      <div className="admin-page">
        <header className="admin-header">
          <Link className="brand" to="/">
            <span className="brand-mark">D</span> devlaunch
            <span className="brand-dot">.</span>
          </Link>
          <Link className="text-link" to="/">Back to website</Link>
        </header>

        <form className="login-card" onSubmit={login}>
          <div className="login-icon"><ShieldCheck size={26} /></div>
          <span className="eyebrow">TEAM ACCESS</span>
          <h1>Welcome back.</h1>
          <p>Manage website content, enquiries, and customer feedback.</p>

          <label>
            Email address
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
            />
          </label>

          <label>
            Password
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
              placeholder="Enter admin password"
            />
          </label>

          {message && <p className="form-message error">{message}</p>}

          <button className="button button-primary submit-button" disabled={loading}>
            {loading ? "Signing in..." : "Sign in"}
          </button>
        </form>

        <footer className="admin-footer">
          DevLaunch admin · Keep customer information private.
        </footer>
      </div>
    );
  }

  return (
    <div className="admin-page">
      <header className="admin-header">
        <Link className="brand" to="/">
          <span className="brand-mark">D</span> devlaunch
          <span className="brand-dot">.</span>
        </Link>
        <Link className="text-link" to="/">Back to website</Link>
      </header>

      <main className="admin-main">
        <div className="admin-title">
          <div>
            <span className="eyebrow">DEVLAUNCH / ADMIN</span>
            <h1>Website management</h1>
            <p>Edit your content and manage customer enquiries and feedback.</p>
          </div>

          <div className="admin-actions">
            <button className="button button-light" onClick={refreshCurrentTab} disabled={loading}>
              <RefreshCw size={16} /> Refresh
            </button>
            <button className="button button-dark" onClick={logout}>
              <LogOut size={16} /> Sign out
            </button>
          </div>
        </div>

        <nav className="admin-tabs" aria-label="Admin sections">
          <button className={tab === "content" ? "is-active" : ""} onClick={() => { setTab("content"); setMessage(""); }}>
            Website content
          </button>
          <button className={tab === "enquiries" ? "is-active" : ""} onClick={() => { setTab("enquiries"); setMessage(""); }}>
            Enquiries ({items.length})
          </button>
          <button className={tab === "feedback" ? "is-active" : ""} onClick={() => { setTab("feedback"); setMessage(""); }}>
            Customer feedback ({feedback.length})
          </button>
        </nav>

        {message && <p className="admin-message" role="status">{message}</p>}

        {tab === "content" && (
          <section className="admin-panel">
            <div className="admin-panel-heading">
              <div>
                <h2>Edit website content</h2>
                <p>Choose a section, edit its JSON, and save your changes.</p>
              </div>
            </div>

            <label className="admin-field">
              Website section
              <select value={section} onChange={(event) => selectSection(event.target.value)}>
                {sections.map((item) => (
                  <option key={item.key} value={item.key}>{item.label}</option>
                ))}
              </select>
            </label>

            <form onSubmit={saveContent}>
              <label className="admin-field">
                Section content (JSON)
                <textarea
                  className="content-json-editor"
                  value={editor}
                  onChange={(event) => setEditor(event.target.value)}
                  spellCheck={false}
                  rows={20}
                  required
                />
              </label>

              <div className="admin-editor-actions">
                <button type="button" className="button button-light" onClick={() => selectSection(section)}>
                  Reset unsaved edits
                </button>
                <button type="submit" className="button button-primary" disabled={saving}>
                  {saving ? "Saving..." : "Save content"}
                </button>
              </div>
            </form>

            <p className="admin-help">
              Tip: Services and packages use arrays. Keep the JSON structure valid.
              Saving here stores content in the database; the public page must also read
              these saved fields to display your changes.
            </p>
          </section>
        )}

        {tab === "enquiries" && (
          <section className="admin-panel">
            <div className="admin-panel-heading">
              <div>
                <h2>Project enquiries <span className="count-pill">{items.length}</span></h2>
                <p>Review incoming requests and update their status.</p>
              </div>
            </div>

            {items.length === 0 ? (
              <div className="empty-state">
                <Send size={28} />
                <h2>No enquiries yet</h2>
                <p>Contact form submissions will appear here.</p>
              </div>
            ) : (
              <div className="enquiry-list">
                {items.map((item) => (
                  <article className="enquiry-card" key={item.id}>
                    <div className="enquiry-heading">
                      <div>
                        <span className="enquiry-service">{item.service}</span>
                        <h2>{item.name}</h2>
                        <a href={`mailto:${item.email}`}>{item.email}</a>
                      </div>
                      <select
                        value={item.status}
                        onChange={(event) => changeStatus(item.id, event.target.value)}
                        aria-label={`Status for ${item.name}`}
                      >
                        <option>New</option>
                        <option>Contacted</option>
                        <option>Closed</option>
                      </select>
                    </div>
                    <p>{item.message}</p>
                    <div className="enquiry-bottom">
                      <small>{new Date(item.created_at).toLocaleString()}</small>
                      <button className="delete-button" onClick={() => removeItem(item.id)}>
                        <Trash2 size={15} /> Delete
                      </button>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </section>
        )}

        {tab === "feedback" && (
          <section className="admin-panel">
            <div className="admin-panel-heading">
              <div>
                <h2>Customer feedback <span className="count-pill">{feedback.length}</span></h2>
                <p>Only approved feedback is returned by the public feedback API.</p>
              </div>
            </div>

            {feedback.length === 0 ? (
              <div className="empty-state">
                <Sparkles size={28} />
                <h2>No feedback yet</h2>
                <p>Customer reviews will appear here after they are submitted.</p>
              </div>
            ) : (
              <div className="enquiry-list">
                {feedback.map((item) => (
                  <article className="enquiry-card" key={item.id}>
                    <div className="enquiry-heading">
                      <div>
                        <h2>{item.customer_name}</h2>
                        <p className="feedback-stars" aria-label={`${item.rating} out of 5 stars`}>
                          {"★".repeat(Number(item.rating))}{"☆".repeat(5 - Number(item.rating))}
                          <span> ({item.rating}/5)</span>
                        </p>
                      </div>
                      <span className={`feedback-status status-${item.status.toLowerCase()}`}>
                        {item.status}
                      </span>
                    </div>

                    <p>{item.review}</p>

                    <div className="enquiry-bottom">
                      <small>{new Date(item.created_at).toLocaleString()}</small>
                      <div className="feedback-actions">
                        <select
                          value={item.status}
                          onChange={(event) => changeFeedbackStatus(item.id, event.target.value)}
                          aria-label={`Feedback status for ${item.customer_name}`}
                        >
                          <option>Pending</option>
                          <option>Approved</option>
                          <option>Hidden</option>
                        </select>
                        <button className="delete-button" onClick={() => removeFeedback(item.id)}>
                          <Trash2 size={15} /> Delete
                        </button>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </section>
        )}
      </main>

      <footer className="admin-footer">
        DevLaunch admin · Keep customer information private.
      </footer>
    </div>
  );
}

export default function App() {
  return <Routes><Route path="/" element={<LandingPage/>}/><Route path="/admin" element={<AdminPage/>}/><Route path="*" element={<LandingPage/>}/></Routes>;
}
