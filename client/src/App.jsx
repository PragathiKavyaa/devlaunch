import { useState } from "react";
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

function Header() {
  const [open, setOpen] = useState(false);
  return <header className="header"><nav className="nav container">
    <Link className="brand" to="/" onClick={() => setOpen(false)}><span className="brand-mark">D</span> devlaunch<span className="brand-dot">.</span></Link>
    <button className="menu-toggle" aria-label="Toggle navigation" onClick={() => setOpen(!open)}>{open ? <X/> : <Menu/>}</button>
    <div className={`nav-links ${open ? "is-open" : ""}`}>
      <a href="/#services" onClick={() => setOpen(false)}>Services</a>
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

function LandingPage() {
  return <>
    <Header/>
    <main>
      <section className="hero container">
        <div className="hero-copy">
          <div className="eyebrow"><span className="pulse"></span> YOUR IDEAS, BUILT BETTER</div>
          <h1>Build what's next.<br/><span>Make it matter.</span></h1>
          <p className="hero-text">We turn ambitious ideas into useful digital experiences — from your first landing page to the product that takes you further.</p>
          <div className="hero-actions"><a className="button button-primary" href="#contact">Start a project <ArrowUpRight size={17}/></a><a className="text-link" href="#services">Explore what we do <span>↘</span></a></div>
          <div className="hero-proof"><div className="avatar-stack"><span>JD</span><span>AK</span><span>MK</span></div><div><strong>Small team. Big ideas.</strong><small>Thoughtful work, from start to launch.</small></div></div>
        </div>
        <div className="hero-art" aria-label="Abstract digital product illustration">
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
        <div className="section-heading"><div><span className="eyebrow">WHAT WE DO</span><h2>Digital work that<br/>works <em>for you.</em></h2></div><p>Great technology should make things easier. We bring strategy, design, and development together to build solutions with a real purpose.</p></div>
        <div className="services-grid">{services.map(({icon: Icon, title, text}, i) => <article className="service-card" key={title}><div className="service-top"><span className="service-icon"><Icon size={22}/></span><span className="service-number">0{i+1}</span></div><h3>{title}</h3><p>{text}</p><a href="#contact" aria-label={`Ask us about ${title}`} className="service-arrow"><ArrowUpRight size={19}/></a></article>)}</div>
      </section>
      <section className="about-section" id="about"><div className="container about-layout"><div className="about-art"><div className="about-sticker"><Sparkles size={22}/><span>Curious minds.<br/>Careful makers.</span></div><div className="about-shape shape-one"></div><div className="about-shape shape-two"></div><div className="about-orbit"></div><span className="about-caption">IDEAS IN MOTION — EST. 2026</span></div><div className="about-copy"><span className="eyebrow">A LITTLE ABOUT US</span><h2>Less noise.<br/>More <em>meaning.</em></h2><p>We're a digital team that believes the best work happens when clear thinking meets good craft. No unnecessary complexity — just useful, thoughtful products built around your goals.</p><ul><li><CheckCircle2/> Clear communication, at every step</li><li><CheckCircle2/> Practical solutions, not buzzwords</li><li><CheckCircle2/> Built to grow with your business</li></ul><a className="text-link dark-link" href="#contact">Let's build something useful <ArrowUpRight size={17}/></a></div></div></section>
      <section className="section container process-section" id="process"><div className="section-heading"><div><span className="eyebrow">HOW WE WORK</span><h2>From first thought<br/>to <em>first launch.</em></h2></div><p>A simple, collaborative process keeps the work focused and helps everyone know what comes next.</p></div><div className="process-grid">{[{n:"01",t:"Discover",d:"We learn about your goals, your audience, and the problem to solve."},{n:"02",t:"Design",d:"We shape the experience and agree on a clear direction before building."},{n:"03",t:"Develop",d:"We turn the plan into a responsive, tested product."},{n:"04",t:"Launch",d:"We help you go live and plan the next improvements."}].map(s=><article key={s.n} className="process-step"><span>{s.n}</span><h3>{s.t}</h3><p>{s.d}</p></article>)}</div></section>
      <section className="contact-section" id="contact"><div className="container contact-layout"><div className="contact-copy"><span className="eyebrow">HAVE A PROJECT IN MIND?</span><h2>Let's make<br/>something <em>good.</em></h2><p>Tell us what you're thinking. A rough idea is a perfectly good place to start.</p><div className="contact-note"><span className="note-icon"><ShieldCheck/></span><span><strong>Good conversations start here.</strong><small>Your details are sent securely to our project team.</small></span></div></div><div className="contact-form-wrap"><ContactForm/></div></div></section>
    </main>
    <footer className="footer"><div className="container footer-inner"><Link className="brand" to="/"><span className="brand-mark">D</span> devlaunch<span className="brand-dot">.</span></Link><span>Thoughtful digital, built together.</span><div><a href="#services">Services</a><a href="#contact">Contact</a><Link to="/admin">Admin</Link></div><small>© {new Date().getFullYear()} DevLaunch Studio</small></div></footer>
  </>;
}

function AdminPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("admin@devlaunch.local");
  const [password, setPassword] = useState("");
  const [token, setToken] = useState("");
  const [items, setItems] = useState([]);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function login(e) {
    e.preventDefault(); setLoading(true); setMessage("");
    try {
      const r = await fetch(`${API}/api/admin/login`, {method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({email,password})});
      const d = await r.json(); if(!r.ok) throw new Error(d.message || "Login failed");
      setToken(d.token); setPassword(""); await loadItems(d.token); setMessage("Signed in successfully.");
    } catch(err) { setMessage(err.message); } finally { setLoading(false); }
  }
  async function loadItems(auth = token) {
    try {
      const r = await fetch(`${API}/api/admin/enquiries`, {headers:{Authorization:`Bearer ${auth}`}});
      const d = await r.json(); if(!r.ok) throw new Error(d.message || "Could not load enquiries");
      setItems(d); setMessage("");
    } catch(err) { setMessage(err.message); }
  }
  async function changeStatus(id, status) {
    const r = await fetch(`${API}/api/admin/enquiries/${id}/status`, {method:"PATCH",headers:{"Content-Type":"application/json",Authorization:`Bearer ${token}`},body:JSON.stringify({status})});
    const d = await r.json(); if(!r.ok) return setMessage(d.message || "Update failed");
    setItems(items.map(item => item.id === id ? {...item,status} : item)); setMessage("Status updated.");
  }
  async function removeItem(id) {
    if(!window.confirm("Delete this enquiry permanently?")) return;
    const r = await fetch(`${API}/api/admin/enquiries/${id}`, {method:"DELETE",headers:{Authorization:`Bearer ${token}`}});
    const d = await r.json(); if(!r.ok) return setMessage(d.message || "Delete failed");
    setItems(items.filter(item => item.id !== id)); setMessage("Enquiry deleted.");
  }
  function logout() { setToken(""); setItems([]); setMessage(""); navigate("/admin"); }

  return <div className="admin-page"><header className="admin-header"><Link className="brand" to="/"><span className="brand-mark">D</span> devlaunch<span className="brand-dot">.</span></Link><Link className="text-link" to="/">← Back to website</Link></header>
    {!token ? <form className="login-card" onSubmit={login}><div className="login-icon"><ShieldCheck size={26}/></div><span className="eyebrow">TEAM ACCESS</span><h1>Welcome back.</h1><p>Sign in to manage project enquiries.</p><label>Email address<input type="email" value={email} onChange={e=>setEmail(e.target.value)} required/></label><label>Password<input type="password" value={password} onChange={e=>setPassword(e.target.value)} required placeholder="Enter admin password"/></label>{message && <p className="form-message error">{message}</p>}<button className="button button-primary submit-button" disabled={loading}>{loading ? "Signing in..." : "Sign in"}</button><small className="demo-hint">Demo: admin@devlaunch.local / ChangeMe123!</small></form> :
    <main className="admin-main"><div className="admin-title"><div><span className="eyebrow">DEVLAUNCH / ADMIN</span><h1>Enquiries <span className="count-pill">{items.length}</span></h1><p>Review incoming project requests and keep their status up to date.</p></div><div className="admin-actions"><button className="button button-light" onClick={()=>loadItems()}><RefreshCw size={16}/> Refresh</button><button className="button button-dark" onClick={logout}><LogOut size={16}/> Sign out</button></div></div>{message && <p className="admin-message">{message}</p>}{items.length===0 ? <div className="empty-state"><Send size={28}/><h2>No enquiries yet</h2><p>Contact form submissions will appear here.</p></div> : <div className="enquiry-list">{items.map(item=><article className="enquiry-card" key={item.id}><div className="enquiry-heading"><div><span className="enquiry-service">{item.service}</span><h2>{item.name}</h2><a href={`mailto:${item.email}`}>{item.email}</a></div><select value={item.status} onChange={e=>changeStatus(item.id,e.target.value)} aria-label={`Status for ${item.name}`}><option>New</option><option>Contacted</option><option>Closed</option></select></div><p>{item.message}</p><div className="enquiry-bottom"><small>{new Date(item.created_at).toLocaleString()}</small><button className="delete-button" onClick={()=>removeItem(item.id)}><Trash2 size={15}/> Delete</button></div></article>)}</div>}</main>}
    <footer className="admin-footer">DevLaunch admin · Keep customer information private.</footer></div>;
}

export default function App() {
  return <Routes><Route path="/" element={<LandingPage/>}/><Route path="/admin" element={<AdminPage/>}/><Route path="*" element={<LandingPage/>}/></Routes>;
}
